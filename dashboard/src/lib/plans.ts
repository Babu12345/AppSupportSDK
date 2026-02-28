function envInt(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export const FREE_LIMITS = {
  conversationsPerMonth: envInt('NEXT_PUBLIC_FREE_CONVERSATIONS_PER_MONTH', 100),
  maxOrganizations: envInt('NEXT_PUBLIC_FREE_MAX_ORGANIZATIONS', 1),
  maxKnowledgeSources: envInt('NEXT_PUBLIC_FREE_MAX_KNOWLEDGE_SOURCES', 5),
};

export const FREE_FEATURES = [
  `${FREE_LIMITS.conversationsPerMonth} AI conversations/month`,
  `${FREE_LIMITS.maxOrganizations} organization`,
  `${FREE_LIMITS.maxKnowledgeSources} knowledge articles`,
  'Community support',
];

export const PRO_FEATURES = [
  'Unlimited AI conversations',
  'Unlimited organizations',
  'Unlimited knowledge articles',
  'Priority support',
  '7-day free trial',
];

export const PRO_PRICE = '$5';
