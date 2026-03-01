const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://appsupportsdk-production.up.railway.app';

// Auth token management
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('currentOrgId');
}

export function getCurrentOrgId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentOrgId');
}

export function setCurrentOrgId(orgId: string): void {
  localStorage.setItem('currentOrgId', orgId);
}

// Custom error for limit-reached responses
export class LimitReachedError extends Error {
  limitType: 'conversations' | 'organizations' | 'knowledge';
  constructor(message: string, limitType: 'conversations' | 'organizations' | 'knowledge') {
    super(message);
    this.name = 'LimitReachedError';
    this.limitType = limitType;
  }
}

// Detect limit type from the endpoint
function detectLimitType(endpoint: string): 'conversations' | 'organizations' | 'knowledge' {
  if (endpoint.includes('/chat')) return 'conversations';
  if (endpoint.includes('/organizations')) return 'organizations';
  return 'knowledge';
}

// API request helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const orgId = getCurrentOrgId();

  // Add orgId to query string if needed
  let url = `${API_BASE}${endpoint}`;
  if (orgId && !endpoint.includes('orgId=') && !endpoint.startsWith('/v1/auth') && !endpoint.startsWith('/v1/organizations')) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url += `${separator}orgId=${orgId}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    if (error.limit_reached) {
      throw new LimitReachedError(error.error || 'Plan limit reached', detectLimitType(endpoint));
    }
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier?: string;
}

export interface Organization {
  id: string;
  name: string;
  apiKey: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  organizations: Organization[];
}

export async function signup(
  email: string,
  password: string,
  name?: string,
  organizationName?: string
): Promise<AuthResponse> {
  return apiRequest('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, organizationName }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function googleLogin(accessToken: string): Promise<AuthResponse> {
  return apiRequest('/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken }),
  });
}

export async function getCurrentUser(): Promise<{ user: User; organizations: Organization[] }> {
  return apiRequest('/v1/auth/me');
}

// Organization API
export async function getOrganizations(): Promise<{ organizations: Organization[] }> {
  return apiRequest('/v1/organizations');
}

export async function createOrganization(name: string): Promise<Organization> {
  return apiRequest('/v1/organizations', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteOrganization(id: string): Promise<void> {
  await apiRequest(`/v1/organizations/${id}`, { method: 'DELETE' });
}

// Knowledge API
export interface GitHubContentSources {
  readme: boolean;
  wiki: boolean;
  docs: boolean;
  releases: boolean;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  sourceUrl?: string;
  sourceConfig?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getKnowledgeSources(): Promise<{ sources: KnowledgeSource[] }> {
  return apiRequest('/v1/knowledge');
}

export async function createKnowledgeSource(data: {
  title: string;
  content: string;
  sourceType?: string;
  sourceUrl?: string;
  sourceConfig?: GitHubContentSources;
}): Promise<{ source: KnowledgeSource }> {
  return apiRequest('/v1/knowledge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKnowledgeSource(
  id: string,
  data: { title?: string; content?: string; sourceType?: string; sourceUrl?: string; sourceConfig?: GitHubContentSources }
): Promise<{ source: KnowledgeSource }> {
  return apiRequest(`/v1/knowledge/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteKnowledgeSource(id: string): Promise<void> {
  await apiRequest(`/v1/knowledge/${id}`, { method: 'DELETE' });
}

export interface ScrapeResult {
  title: string;
  content: string;
  url: string;
  contentLength: number;
}

export async function scrapeUrlPreview(url: string, signal?: AbortSignal): Promise<ScrapeResult> {
  return apiRequest('/v1/knowledge/scrape', {
    method: 'POST',
    body: JSON.stringify({ url }),
    signal,
  });
}

export async function refreshKnowledgeSource(id: string): Promise<{ source: KnowledgeSource }> {
  return apiRequest(`/v1/knowledge/${id}/refresh`, { method: 'POST' });
}

export async function scrapeGitHubPreview(url: string, sources?: GitHubContentSources, signal?: AbortSignal): Promise<ScrapeResult> {
  return apiRequest('/v1/knowledge/scrape-github', {
    method: 'POST',
    body: JSON.stringify({ url, sources }),
    signal,
  });
}

// GitHub OAuth API
export interface GitHubRepo {
  fullName: string;
  name: string;
  owner: string;
  ownerAvatar: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stars: number;
  updatedAt: string;
  url: string;
}

export async function getGitHubRepos(query?: string): Promise<{ repos: GitHubRepo[] }> {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiRequest(`/v1/auth/github/repos${params}`);
}

export interface GitHubStatus {
  connected: boolean;
  username?: string;
}

export async function getGitHubStatus(): Promise<GitHubStatus> {
  return apiRequest('/v1/auth/github/status');
}

export async function connectGitHub(code: string): Promise<GitHubStatus> {
  return apiRequest('/v1/auth/github/callback', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function disconnectGitHub(): Promise<{ connected: false }> {
  return apiRequest('/v1/auth/github', { method: 'DELETE' });
}

// Billing API
export interface UsageStats {
  tier: string;
  hasUsedTrial: boolean;
  conversations: {
    used: number;
    limit: number;
    remaining: number;
    orgUsed: number | null;
  };
  limits: {
    maxOrganizations: number;
    maxKnowledgeSources: number;
    conversationsPerMonth: number;
  };
}

export async function getUsageStats(orgId?: string): Promise<UsageStats> {
  const params = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
  return apiRequest(`/v1/auth/usage${params}`);
}

export async function createCheckoutSession(): Promise<{ url: string }> {
  return apiRequest('/v1/stripe/checkout', { method: 'POST' });
}

export async function createPortalSession(): Promise<{ url: string }> {
  return apiRequest('/v1/stripe/portal', { method: 'POST' });
}
