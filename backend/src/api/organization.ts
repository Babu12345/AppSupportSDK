import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

function generateApiKey(): string {
  return `sk_live_${crypto.randomBytes(24).toString('hex')}`;
}

// POST /v1/organizations - Create a new organization
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const apiKey = generateApiKey();

    const organization = await prisma.organization.create({
      data: {
        name,
        apiKey,
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

// GET /v1/organizations/:id - Get organization details (requires API key)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const apiKey = authHeader.substring(7);
    const organization = await prisma.organization.findUnique({
      where: { apiKey },
    });

    if (!organization || organization.id !== req.params.id) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    res.json({
      id: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

export { router as organizationRouter };
