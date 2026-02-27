import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function generateApiKey(): string {
  return `sk_live_${crypto.randomBytes(24).toString('hex')}`;
}

// Helper to get user from JWT
async function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return await prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch {
    return null;
  }
}

// GET /v1/organizations - List user's organizations (JWT auth)
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const organizations = await prisma.organization.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        apiKey: org.apiKey,
        createdAt: org.createdAt,
      })),
    });
  } catch (error) {
    console.error('List organizations error:', error);
    res.status(500).json({ error: 'Failed to list organizations' });
  }
});

// POST /v1/organizations - Create a new organization (JWT auth)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const apiKey = generateApiKey();

    const organization = await prisma.organization.create({
      data: {
        name,
        apiKey,
        userId: user.id,
      },
    });

    res.status(201).json({
      id: organization.id,
      name: organization.name,
      apiKey: organization.apiKey,
      createdAt: organization.createdAt,
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// GET /v1/organizations/:id - Get organization details (JWT auth)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;
    const organization = await prisma.organization.findFirst({
      where: { id, userId: user.id },
    });

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    res.json({
      id: organization.id,
      name: organization.name,
      apiKey: organization.apiKey,
      createdAt: organization.createdAt,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// DELETE /v1/organizations/:id - Delete organization (JWT auth)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const id = req.params.id as string;
    const organization = await prisma.organization.findFirst({
      where: { id, userId: user.id },
    });

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    await prisma.organization.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

export { router as organizationRouter };
