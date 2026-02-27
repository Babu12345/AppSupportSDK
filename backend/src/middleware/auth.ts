import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const organization = await prisma.organization.findUnique({
      where: { apiKey },
    });

    if (!organization) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Attach organization to request for use in route handlers
    (req as any).organization = organization;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
