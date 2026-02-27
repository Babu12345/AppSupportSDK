import { PrismaClient } from '@prisma/client';
import { SUBSCRIPTION_LIMITS, SubscriptionTier } from '../constants';

const prisma = new PrismaClient();

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getConversationsThisMonth(userId: string): Promise<number> {
  return prisma.chatEvent.count({
    where: {
      userId,
      createdAt: { gte: getStartOfMonth() },
    },
  });
}

export async function checkConversationLimit(userId: string, tier: SubscriptionTier) {
  const limits = SUBSCRIPTION_LIMITS[tier];
  if (limits.conversationsPerMonth === Infinity) {
    return { allowed: true, current: 0, limit: Infinity, remaining: Infinity };
  }

  const current = await getConversationsThisMonth(userId);
  return {
    allowed: current < limits.conversationsPerMonth,
    current,
    limit: limits.conversationsPerMonth,
    remaining: Math.max(0, limits.conversationsPerMonth - current),
  };
}

export async function recordConversation(userId: string): Promise<void> {
  await prisma.chatEvent.create({ data: { userId } });
}
