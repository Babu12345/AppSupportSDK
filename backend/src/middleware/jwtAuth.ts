import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    apiKey: string;
  };
}

// Authenticate dashboard users via JWT
export async function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get organization from query param or header, verify user owns it
export async function getOrganization(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const orgId = req.query.orgId as string || req.headers['x-organization-id'] as string;

  if (!orgId) {
    res.status(400).json({ error: 'Organization ID required' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const org = await prisma.organization.findFirst({
      where: {
        id: orgId,
        userId: req.user.id,
      },
    });

    if (!org) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    req.organization = {
      id: org.id,
      name: org.name,
      apiKey: org.apiKey,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to get organization' });
  }
}
