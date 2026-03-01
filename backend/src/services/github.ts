import Anthropic from '@anthropic-ai/sdk';

let anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    const cleanedKey = apiKey.trim().replace(/^["']|["']$/g, '').replace(/[\r\n]/g, '').replace(/\\/g, '');
    anthropic = new Anthropic({ apiKey: cleanedKey });
  }
  return anthropic;
}

const MAX_CHARS = 50000;
const GITHUB_API = 'https://api.github.com';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  url: string;
}

export interface GitHubScrapeResult {
  title: string;
  content: string;
  url: string;
  contentLength: number;
}

function githubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'SupportKit/1.0',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
    throw new Error('URL must be a GitHub repository (github.com)');
  }

  const parts = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid GitHub URL — expected format: https://github.com/owner/repo');
  }

  return { owner: parts[0], repo: parts[1] };
}

async function fetchRepoMetadata(owner: string, repo: string, token?: string): Promise<GitHubRepoInfo> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: githubHeaders(token),
      signal: controller.signal,
    });

    if (response.status === 404) {
      throw new Error(`Repository not found: ${owner}/${repo}. Make sure it exists and is accessible.`);
    }
    if (response.status === 403) {
      const body = await response.json().catch(() => ({}));
      if (body.message?.includes('rate limit')) {
        throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
      }
      throw new Error('Access denied. This may be a private repo — connect your GitHub account in Settings.');
    }
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      owner,
      repo,
      description: data.description || null,
      language: data.language || null,
      topics: data.topics || [],
      stars: data.stargazers_count || 0,
      url: data.html_url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchReadme(owner: string, repo: string, token?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: githubHeaders(token),
      signal: controller.signal,
    });

    if (response.status === 404) {
      return ''; // No README — summary will be based on metadata only
    }
    if (!response.ok) {
      return ''; // Gracefully degrade
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    if (content.length > MAX_CHARS) {
      return content.substring(0, MAX_CHARS) + '\n\n[Content truncated]';
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

async function summarizeForUsers(readmeContent: string, repoInfo: GitHubRepoInfo): Promise<string> {
  const systemPrompt = `You are a technical writer creating a user-facing knowledge article about a software application.
Your job is to summarize the README and repository information into a helpful guide for END USERS of this application.

IMPORTANT RULES:
1. Focus ONLY on user-facing information: what the app does, how to use it, key features, getting started steps
2. DO NOT include: source code snippets, implementation details, architecture decisions, internal APIs, build instructions, CI/CD details, contributor guidelines
3. DO NOT include: proprietary algorithms, database schemas, deployment configs, environment variables, developer setup
4. Write in clear, non-technical language when possible
5. Use markdown formatting with headers and bullet points
6. If the README is primarily code/technical, extract only the user-relevant parts
7. If very little user-facing content exists, note what the app does based on available information and keep it brief

Output a clean, helpful knowledge article that could be shown to end users seeking support.`;

  const userMessage = `Repository: ${repoInfo.owner}/${repoInfo.repo}
Description: ${repoInfo.description || 'No description'}
Language: ${repoInfo.language || 'Unknown'}
Topics: ${repoInfo.topics.join(', ') || 'None'}
Stars: ${repoInfo.stars}

README content:
${readmeContent || 'No README available.'}`;

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock && textBlock.type === 'text' ? textBlock.text : '';
  } catch (error) {
    console.error('Claude summarization error:', error);
    throw new Error('Failed to generate summary. Please try again.');
  }
}

export async function fetchAndSummarizeRepo(url: string, token?: string): Promise<GitHubScrapeResult> {
  const { owner, repo } = parseGitHubUrl(url);

  const [repoInfo, readmeContent] = await Promise.all([
    fetchRepoMetadata(owner, repo, token),
    fetchReadme(owner, repo, token),
  ]);

  if (!readmeContent && !repoInfo.description) {
    throw new Error('This repository has no README and no description. Cannot generate a knowledge article.');
  }

  const summary = await summarizeForUsers(readmeContent, repoInfo);

  return {
    title: repoInfo.description
      ? `${owner}/${repo} — ${repoInfo.description}`
      : `${owner}/${repo}`,
    content: summary,
    url: repoInfo.url,
    contentLength: summary.length,
  };
}
