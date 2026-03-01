import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET } from '../config';
import { getConversationsThisMonth, getOrgConversationsThisMonth } from '../services/usage';
import { SUBSCRIPTION_LIMITS, SubscriptionTier } from '../constants';
const router = Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Generate API key
function generateApiKey(): string {
  return `sk_live_${crypto.randomBytes(24).toString('hex')}`;
}

// POST /v1/auth/signup - Create new account
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, organizationName } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user and default organization
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        organizations: {
          create: {
            name: organizationName || 'My Organization',
            apiKey: generateApiKey(),
          },
        },
      },
      include: {
        organizations: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
      organizations: user.organizations.map(org => ({
        id: org.id,
        name: org.name,
        apiKey: org.apiKey,
      })),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /v1/auth/login - Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        organizations: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if user signed up with Google (no password set)
    if (!user.passwordHash) {
      res.status(401).json({ error: 'This account uses Google sign-in. Please sign in with Google.' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
      organizations: user.organizations.map(org => ({
        id: org.id,
        name: org.name,
        apiKey: org.apiKey,
      })),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /v1/auth/google - Sign in with Google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      res.status(400).json({ error: 'Google access token is required' });
      return;
    }

    // Use access token to get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const userInfo = await userInfoResponse.json() as { sub: string; email: string; name?: string };
    const { sub: googleId, email, name } = userInfo;

    if (!email) {
      res.status(401).json({ error: 'Could not get email from Google account' });
      return;
    }

    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email: email.toLowerCase() },
        ],
      },
      include: { organizations: true },
    });

    if (user) {
      // Link Google account if user exists by email but hasn't linked Google yet
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, name: user.name || name },
          include: { organizations: true },
        });
      }
    } else {
      // Create new user with Google account
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          googleId,
          name,
          organizations: {
            create: {
              name: 'My Organization',
              apiKey: generateApiKey(),
            },
          },
        },
        include: { organizations: true },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
      organizations: user.organizations.map(org => ({
        id: org.id,
        name: org.name,
        apiKey: org.apiKey,
      })),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// GET /v1/auth/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organizations: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
      },
      organizations: user.organizations.map(org => ({
        id: org.id,
        name: org.name,
        apiKey: org.apiKey,
      })),
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /v1/auth/usage - Get usage stats for current user
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const tier = (user.subscriptionTier || 'free') as SubscriptionTier;
    const limits = SUBSCRIPTION_LIMITS[tier];
    const conversationsUsed = await getConversationsThisMonth(user.id);

    const orgId = req.query.orgId as string | undefined;
    const orgConversations = orgId ? await getOrgConversationsThisMonth(orgId) : null;

    res.json({
      tier: user.subscriptionTier,
      hasUsedTrial: user.hasUsedTrial,
      conversations: {
        used: conversationsUsed,
        limit: limits.conversationsPerMonth,
        remaining: limits.conversationsPerMonth === Infinity
          ? Infinity
          : Math.max(0, limits.conversationsPerMonth - conversationsUsed),
        orgUsed: orgConversations,
      },
      limits: {
        maxOrganizations: limits.maxOrganizations,
        maxKnowledgeSources: limits.maxKnowledgeSources,
        conversationsPerMonth: limits.conversationsPerMonth,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /v1/auth/github/status - Check if user has connected GitHub
router.get('/github/status', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!user.githubId || !user.githubToken) {
      res.json({ connected: false });
      return;
    }

    // Fetch username from GitHub to display
    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${user.githubToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'SupportKit/1.0',
      },
    });

    if (!ghRes.ok) {
      // Token may have been revoked
      res.json({ connected: false });
      return;
    }

    const ghUser = await ghRes.json() as { login: string };
    res.json({ connected: true, username: ghUser.login });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /v1/auth/github/callback - Exchange GitHub OAuth code for token
router.post('/github/callback', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const jwtToken = authHeader.substring(7);
    const decoded = jwt.verify(jwtToken, JWT_SECRET) as { userId: string };

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'GitHub authorization code is required' });
      return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      res.status(500).json({ error: 'GitHub OAuth is not configured' });
      return;
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      res.status(400).json({ error: tokenData.error || 'Failed to exchange GitHub code' });
      return;
    }

    // Fetch GitHub user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'SupportKit/1.0',
      },
    });

    if (!userRes.ok) {
      res.status(400).json({ error: 'Failed to fetch GitHub user info' });
      return;
    }

    const ghUser = await userRes.json() as { id: number; login: string };

    // Store GitHub credentials on user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        githubId: ghUser.id,
        githubToken: tokenData.access_token,
      },
    });

    res.json({ connected: true, username: ghUser.login });
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
});

// GET /v1/auth/github/repos - List user's GitHub repos
router.get('/github/repos', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.githubToken) {
      res.status(400).json({ error: 'GitHub not connected' });
      return;
    }

    const query = (req.query.q as string || '').trim().toLowerCase();
    const headers = {
      'Authorization': `Bearer ${user.githubToken}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'SupportKit/1.0',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // Paginate through all user repos (up to 500)
    let allItems: Array<Record<string, unknown>> = [];
    for (let page = 1; page <= 5; page++) {
      const url = `https://api.github.com/user/repos?sort=updated&per_page=100&page=${page}&affiliation=owner,collaborator,organization_member`;
      const ghRes = await fetch(url, { headers });

      if (!ghRes.ok) {
        res.status(400).json({ error: 'Failed to fetch repositories from GitHub' });
        return;
      }

      const pageData = await ghRes.json() as Array<Record<string, unknown>>;
      allItems.push(...pageData);
      if (pageData.length < 100) break; // Last page
    }

    // Filter by search query if provided
    if (query) {
      allItems = allItems.filter((r) => {
        const name = (r.full_name as string || '').toLowerCase();
        const desc = (r.description as string || '').toLowerCase();
        return name.includes(query) || desc.includes(query);
      });
    }

    const repos = (allItems as Array<{
      full_name: string;
      name: string;
      owner: { login: string; avatar_url: string };
      description: string | null;
      private: boolean;
      language: string | null;
      stargazers_count: number;
      updated_at: string;
      html_url: string;
    }>).slice(0, 30).map(r => ({
      fullName: r.full_name,
      name: r.name,
      owner: r.owner.login,
      ownerAvatar: r.owner.avatar_url,
      description: r.description,
      private: r.private,
      language: r.language,
      stars: r.stargazers_count,
      updatedAt: r.updated_at,
      url: r.html_url,
    }));

    res.json({ repos });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// DELETE /v1/auth/github - Disconnect GitHub account
router.delete('/github', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        githubId: null,
        githubToken: null,
      },
    });

    res.json({ connected: false });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRouter };
