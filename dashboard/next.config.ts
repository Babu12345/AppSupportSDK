import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    NEXT_PUBLIC_FREE_CONVERSATIONS_PER_MONTH: process.env.FREE_CONVERSATIONS_PER_MONTH || '100',
    NEXT_PUBLIC_FREE_MAX_ORGANIZATIONS: process.env.FREE_MAX_ORGANIZATIONS || '1',
    NEXT_PUBLIC_FREE_MAX_KNOWLEDGE_SOURCES: process.env.FREE_MAX_KNOWLEDGE_SOURCES || '5',
    NEXT_PUBLIC_PRO_PRICE_MONTHLY: process.env.PRO_PRICE_MONTHLY || '5',
  },
};

export default nextConfig;
