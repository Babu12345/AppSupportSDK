const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('apiKey') : null;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Knowledge API
export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  sourceUrl?: string;
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
}): Promise<{ source: KnowledgeSource }> {
  return apiRequest('/v1/knowledge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateKnowledgeSource(
  id: string,
  data: { title?: string; content?: string }
): Promise<{ source: KnowledgeSource }> {
  return apiRequest(`/v1/knowledge/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteKnowledgeSource(id: string): Promise<void> {
  return apiRequest(`/v1/knowledge/${id}`, {
    method: 'DELETE',
  });
}

// Organization API
export async function createOrganization(name: string): Promise<{
  id: string;
  name: string;
  apiKey: string;
}> {
  return apiRequest('/v1/organizations', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}
