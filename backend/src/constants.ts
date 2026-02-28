function envInt(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export const PRO_PRICE_MONTHLY = envInt('PRO_PRICE_MONTHLY', 5);

export const SUBSCRIPTION_LIMITS = {
  free: {
    conversationsPerMonth: envInt('FREE_CONVERSATIONS_PER_MONTH', 100),
    maxOrganizations: envInt('FREE_MAX_ORGANIZATIONS', 1),
    maxKnowledgeSources: envInt('FREE_MAX_KNOWLEDGE_SOURCES', 5),
  },
  pro: {
    conversationsPerMonth: Infinity,
    maxOrganizations: Infinity,
    maxKnowledgeSources: Infinity,
  },
};

export type SubscriptionTier = 'free' | 'pro';
