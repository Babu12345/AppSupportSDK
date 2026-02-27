import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateResponse } from '../services/claude.js';
import { authenticateApiKey } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  query: string;
  sessionId?: string;
}

// POST /v1/chat - Send a message and get AI response
router.post('/', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { messages, query, sessionId } = req.body as ChatRequest;
    const organization = (req as any).organization;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    // Get organization's knowledge base
    const knowledgeSources = await prisma.knowledgeSource.findMany({
      where: { organizationId: organization.id },
    });

    // Combine all knowledge into context
    const knowledgeContext = knowledgeSources
      .map(k => `## ${k.title}\n${k.content}`)
      .join('\n\n');

    // Generate response using Claude
    const response = await generateResponse({
      query,
      messages: messages || [],
      knowledgeContext,
      organizationName: organization.name,
    });

    // Store conversation if sessionId provided
    if (sessionId) {
      let conversation = await prisma.conversation.findFirst({
        where: { sessionId, organizationId: organization.id },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            sessionId,
            organizationId: organization.id,
          },
        });
      }

      // Store user message and response
      await prisma.message.createMany({
        data: [
          { conversationId: conversation.id, role: 'user', content: query },
          { conversationId: conversation.id, role: 'assistant', content: response, source: 'cloud' },
        ],
      });
    }

    res.json({
      content: response,
      source: 'cloud',
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export { router as chatRouter };
