export const PRO_PRICE_MONTHLY = 5;

export const SUBSCRIPTION_LIMITS = {
  free: {
    conversationsPerMonth: 100,
    maxOrganizations: 1,
    maxKnowledgeSources: 5,
  },
  pro: {
    conversationsPerMonth: Infinity,
    maxOrganizations: Infinity,
    maxKnowledgeSources: Infinity,
  },
} as const;

export type SubscriptionTier = 'free' | 'pro';
