import Anthropic from '@anthropic-ai/sdk';

// Lazy initialization to ensure env vars are loaded
let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

interface GenerateResponseParams {
  query: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  knowledgeContext: string;
  organizationName: string;
}

export async function generateResponse({
  query,
  messages,
  knowledgeContext,
  organizationName,
}: GenerateResponseParams): Promise<string> {
  const systemPrompt = buildSystemPrompt(knowledgeContext, organizationName);

  // Convert previous messages to Anthropic format
  const conversationHistory: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Add current query
  conversationHistory.push({
    role: 'user',
    content: query,
  });

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory,
    });

    // Extract text from response
    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      return textBlock.text;
    }

    return "I'm sorry, I couldn't generate a response. Would you like to contact our support team?";
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

function buildSystemPrompt(knowledgeContext: string, organizationName: string): string {
  const basePrompt = `You are a helpful customer support assistant for ${organizationName}. Your role is to help users with their questions and issues.

## Guidelines:
1. Be friendly, professional, and concise
2. Only answer questions based on the knowledge base provided below
3. If you don't have information to answer a question, politely say so and offer to connect them with the support team
4. Never make up information or features that aren't in the knowledge base
5. If a question is outside your scope (like technical bugs, billing disputes, or account-specific issues), offer to escalate to the human support team
6. Keep responses focused and actionable`;

  if (knowledgeContext && knowledgeContext.trim().length > 0) {
    return `${basePrompt}

## Knowledge Base:
${knowledgeContext}`;
  }

  return `${basePrompt}

## Note:
No knowledge base has been configured yet. For now, provide general helpful responses and offer to connect users with the support team for specific questions.`;
}
