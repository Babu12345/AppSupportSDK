import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { SUBSCRIPTION_LIMITS, SubscriptionTier } from '../constants';
import { scrapeUrl } from '../services/scraper.js';
import { fetchAndSummarizeRepo } from '../services/github.js';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  organization?: { id: string; name: string };
  userId?: string;
}

// Middleware to authenticate via API key OR JWT + orgId
async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  // Check if it's an API key (starts with sk_live_)
  if (token.startsWith('sk_live_')) {
    const organization = await prisma.organization.findUnique({
      where: { apiKey: token },
    });

    if (!organization) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    req.organization = { id: organization.id, name: organization.name };
    next();
    return;
  }

  // Otherwise, treat as JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const orgId = req.query.orgId as string || req.headers['x-organization-id'] as string;

    if (!orgId) {
      res.status(400).json({ error: 'Organization ID required (use ?orgId= or X-Organization-Id header)' });
      return;
    }

    const organization = await prisma.organization.findFirst({
      where: { id: orgId, userId: decoded.userId },
    });

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    req.organization = { id: organization.id, name: organization.name };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /v1/knowledge - Get all knowledge sources for the organization
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sources = await prisma.knowledgeSource.findMany({
      where: { organizationId: req.organization!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sources });
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge sources' });
  }
});

// GET /v1/knowledge/bundle - Get knowledge bundle for SDK sync
router.get('/bundle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sources = await prisma.knowledgeSource.findMany({
      where: { organizationId: req.organization!.id },
    });

    const content = sources
      .map(k => `## ${k.title}\n${k.content}`)
      .join('\n\n');

    res.json({
      version: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      content,
      organizationName: req.organization!.name,
    });
  } catch (error) {
    console.error('Get bundle error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge bundle' });
  }
});

// POST /v1/knowledge/scrape - Preview scraped content from a URL
router.post('/scrape', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    const result = await scrapeUrl(url);

    res.json({
      title: result.title,
      content: result.content,
      url: result.url,
      contentLength: result.contentLength,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    const message = error instanceof Error ? error.message : 'Failed to scrape URL';
    res.status(422).json({ error: message });
  }
});

// POST /v1/knowledge/scrape-github - Preview GitHub repo as knowledge source
router.post('/scrape-github', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    // Look up user's GitHub token if available
    let githubToken: string | undefined;
    if (req.userId) {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { githubToken: true },
      });
      if (user?.githubToken) {
        githubToken = user.githubToken;
      }
    }

    const result = await fetchAndSummarizeRepo(url, githubToken);

    res.json({
      title: result.title,
      content: result.content,
      url: result.url,
      contentLength: result.contentLength,
    });
  } catch (error) {
    console.error('GitHub scrape error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch GitHub repository';
    res.status(422).json({ error: message });
  }
});

// POST /v1/knowledge - Add a new knowledge source
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, sourceType = 'manual', sourceUrl } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'title and content are required' });
      return;
    }

    // Check knowledge source limit
    const org = await prisma.organization.findUnique({
      where: { id: req.organization!.id },
      include: { user: true },
    });
    if (org) {
      const tier = (org.user.subscriptionTier || 'free') as SubscriptionTier;
      const limits = SUBSCRIPTION_LIMITS[tier];
      if (limits.maxKnowledgeSources !== Infinity) {
        const count = await prisma.knowledgeSource.count({
          where: { organizationId: req.organization!.id },
        });
        if (count >= limits.maxKnowledgeSources) {
          res.status(403).json({
            error: `Free plan allows up to ${limits.maxKnowledgeSources} knowledge articles. Upgrade to Pro for unlimited.`,
            limit_reached: true,
          });
          return;
        }
      }
    }

    const source = await prisma.knowledgeSource.create({
      data: {
        organizationId: req.organization!.id,
        title,
        content,
        sourceType,
        sourceUrl,
      },
    });

    res.status(201).json({ source });
  } catch (error) {
    console.error('Create knowledge error:', error);
    res.status(500).json({ error: 'Failed to create knowledge source' });
  }
});

// PUT /v1/knowledge/:id - Update a knowledge source
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, content, sourceType, sourceUrl } = req.body;

    const existing = await prisma.knowledgeSource.findFirst({
      where: { id, organizationId: req.organization!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Knowledge source not found' });
      return;
    }

    const source = await prisma.knowledgeSource.update({
      where: { id },
      data: { title, content, sourceType, sourceUrl },
    });

    res.json({ source });
  } catch (error) {
    console.error('Update knowledge error:', error);
    res.status(500).json({ error: 'Failed to update knowledge source' });
  }
});

// POST /v1/knowledge/:id/refresh - Re-fetch content from source URL
router.post('/:id/refresh', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.knowledgeSource.findFirst({
      where: { id, organizationId: req.organization!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Knowledge source not found' });
      return;
    }

    if (!existing.sourceUrl || !['url', 'github'].includes(existing.sourceType)) {
      res.status(400).json({ error: 'This knowledge source is not URL-based' });
      return;
    }

    let updatedTitle: string;
    let updatedContent: string;

    if (existing.sourceType === 'github') {
      let githubToken: string | undefined;
      if (req.userId) {
        const user = await prisma.user.findUnique({
          where: { id: req.userId },
          select: { githubToken: true },
        });
        if (user?.githubToken) githubToken = user.githubToken;
      }
      const result = await fetchAndSummarizeRepo(existing.sourceUrl, githubToken);
      updatedTitle = result.title;
      updatedContent = result.content;
    } else {
      const result = await scrapeUrl(existing.sourceUrl);
      updatedTitle = result.title;
      updatedContent = result.content;
    }

    const source = await prisma.knowledgeSource.update({
      where: { id },
      data: {
        title: updatedTitle,
        content: updatedContent,
      },
    });

    res.json({ source });
  } catch (error) {
    console.error('Refresh error:', error);
    const message = error instanceof Error ? error.message : 'Failed to refresh URL content';
    res.status(422).json({ error: message });
  }
});

// DELETE /v1/knowledge/:id - Delete a knowledge source
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.knowledgeSource.findFirst({
      where: { id, organizationId: req.organization!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Knowledge source not found' });
      return;
    }

    await prisma.knowledgeSource.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge source' });
  }
});

export { router as knowledgeRouter };
