import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /v1/knowledge - Get all knowledge sources for the organization
router.get('/', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const organization = (req as any).organization;

    const sources = await prisma.knowledgeSource.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sources });
  } catch (error) {
    console.error('Get knowledge error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge sources' });
  }
});

// GET /v1/knowledge/bundle - Get knowledge bundle for SDK sync
router.get('/bundle', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const organization = (req as any).organization;

    const sources = await prisma.knowledgeSource.findMany({
      where: { organizationId: organization.id },
    });

    // Combine all knowledge into a single bundle for on-device caching
    const content = sources
      .map(k => `## ${k.title}\n${k.content}`)
      .join('\n\n');

    res.json({
      version: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      content,
      organizationName: organization.name,
    });
  } catch (error) {
    console.error('Get bundle error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge bundle' });
  }
});

// POST /v1/knowledge - Add a new knowledge source
router.post('/', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const organization = (req as any).organization;
    const { title, content, sourceType = 'manual', sourceUrl } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'title and content are required' });
      return;
    }

    const source = await prisma.knowledgeSource.create({
      data: {
        organizationId: organization.id,
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
router.put('/:id', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const organization = (req as any).organization;
    const id = req.params.id as string;
    const { title, content } = req.body;

    const existing = await prisma.knowledgeSource.findFirst({
      where: { id, organizationId: organization.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Knowledge source not found' });
      return;
    }

    const source = await prisma.knowledgeSource.update({
      where: { id },
      data: { title, content },
    });

    res.json({ source });
  } catch (error) {
    console.error('Update knowledge error:', error);
    res.status(500).json({ error: 'Failed to update knowledge source' });
  }
});

// DELETE /v1/knowledge/:id - Delete a knowledge source
router.delete('/:id', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const organization = (req as any).organization;
    const id = req.params.id as string;

    const existing = await prisma.knowledgeSource.findFirst({
      where: { id, organizationId: organization.id },
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
