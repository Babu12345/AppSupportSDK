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

export interface GitHubContentSources {
  readme: boolean;
  wiki: boolean;
  docs: boolean;
  releases: boolean;
}

export const DEFAULT_GITHUB_SOURCES: GitHubContentSources = {
  readme: true,
  wiki: false,
  docs: false,
  releases: false,
};

export function parseSourceConfig(configJson: string | null | undefined): GitHubContentSources {
  if (!configJson) return DEFAULT_GITHUB_SOURCES;
  try {
    const parsed = JSON.parse(configJson);
    return {
      readme: typeof parsed.readme === 'boolean' ? parsed.readme : true,
      wiki: typeof parsed.wiki === 'boolean' ? parsed.wiki : false,
      docs: typeof parsed.docs === 'boolean' ? parsed.docs : false,
      releases: typeof parsed.releases === 'boolean' ? parsed.releases : false,
    };
  } catch {
    return DEFAULT_GITHUB_SOURCES;
  }
}

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  url: string;
  hasWiki: boolean;
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
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (body.message?.includes('rate limit')) {
        throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
      }
      throw new Error('Access denied. This may be a private repo — connect your GitHub account in Settings.');
    }
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json() as {
      description?: string; language?: string; topics?: string[];
      stargazers_count?: number; html_url: string; has_wiki?: boolean;
    };
    return {
      owner,
      repo,
      description: data.description || null,
      language: data.language || null,
      topics: data.topics || [],
      stars: data.stargazers_count || 0,
      url: data.html_url,
      hasWiki: data.has_wiki || false,
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

    const data = await response.json() as { content: string };
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    if (content.length > MAX_CHARS) {
      return content.substring(0, MAX_CHARS) + '\n\n[Content truncated]';
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWikiContent(owner: string, repo: string, token?: string): Promise<string> {
  const extensions = ['md', 'mediawiki', 'asciidoc', 'rst', 'org', 'textile', 'rdoc', 'creole', 'pod'];

  for (const ext of extensions) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const url = `https://raw.githubusercontent.com/wiki/${owner}/${repo}/Home.${ext}`;
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const content = await response.text();
        if (content.length > MAX_CHARS / 4) {
          return content.substring(0, MAX_CHARS / 4) + '\n\n[Wiki content truncated]';
        }
        return content;
      }
    } catch {
      clearTimeout(timeout);
    }
  }
  return '';
}

const DOCS_FILE_PATTERN = /\.(md|mdx|markdown|txt|rst|html|htm)$/i;

async function fetchDocsFolder(owner: string, repo: string, token?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const maxFiles = 15;

  // Recursively collect doc files from a directory (1 level deep for subdirs)
  async function listDocFiles(path: string, depth: number): Promise<Array<{ name: string; path: string }>> {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      { headers: githubHeaders(token), signal: controller.signal }
    );
    if (!res.ok) return [];

    const items = await res.json() as Array<{ name: string; path: string; type: string }>;
    const files: Array<{ name: string; path: string }> = [];

    for (const item of items) {
      if (item.type === 'file' && DOCS_FILE_PATTERN.test(item.name)) {
        files.push({ name: item.name, path: item.path });
      } else if (item.type === 'dir' && depth < 2) {
        const subFiles = await listDocFiles(item.path, depth + 1);
        files.push(...subFiles);
      }
    }
    return files;
  }

  try {
    const docFiles = await listDocFiles('docs', 0);
    const selected = docFiles.slice(0, maxFiles);

    if (selected.length === 0) return '';

    console.log(`[docs] Found ${docFiles.length} doc files, fetching ${selected.length}`);

    const fileContents = await Promise.all(
      selected.map(async (file) => {
        try {
          const res = await fetch(
            `${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`,
            { headers: githubHeaders(token) }
          );
          if (!res.ok) return '';
          const data = await res.json() as { content?: string; encoding?: string };
          if (!data.content) return '';
          const text = Buffer.from(data.content, 'base64').toString('utf-8');
          // Use relative path from docs/ as the heading
          const label = file.path.replace(/^docs\//, '');
          return `### ${label}\n\n${text}`;
        } catch {
          return '';
        }
      })
    );

    const combined = fileContents.filter(Boolean).join('\n\n---\n\n');
    if (combined.length > MAX_CHARS / 4) {
      return combined.substring(0, MAX_CHARS / 4) + '\n\n[Docs content truncated]';
    }
    return combined;
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchReleaseNotes(owner: string, repo: string, token?: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/releases?per_page=5`,
      { headers: githubHeaders(token), signal: controller.signal }
    );

    if (!response.ok) return '';

    const releases = await response.json() as Array<{
      tag_name: string;
      name: string | null;
      body: string | null;
      published_at: string;
    }>;

    if (releases.length === 0) return '';

    const notes = releases.map(r => {
      const title = r.name || r.tag_name;
      const date = new Date(r.published_at).toLocaleDateString();
      return `### ${title} (${date})\n\n${r.body || 'No release notes.'}`;
    }).join('\n\n---\n\n');

    if (notes.length > MAX_CHARS / 4) {
      return notes.substring(0, MAX_CHARS / 4) + '\n\n[Release notes truncated]';
    }
    return notes;
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function summarizeForUsers(readmeContent: string, repoInfo: GitHubRepoInfo): Promise<string> {
  const systemPrompt = `You are a technical writer creating a user-facing knowledge article about a software application.
Your job is to summarize the repository information into a helpful guide for END USERS of this application.
The input may contain multiple content sections: README, Wiki pages, Documentation files, and Release Notes.
Synthesize all available information into a single cohesive article.

IMPORTANT RULES:
1. Focus ONLY on user-facing information: what the app does, how to use it, key features, getting started steps
2. If release notes are included, summarize recent changes in a "What's New" section
3. If wiki/docs are included, incorporate relevant user-facing instructions
4. DO NOT include: source code snippets, implementation details, architecture decisions, internal APIs, build instructions, CI/CD details, contributor guidelines
5. DO NOT include: proprietary algorithms, database schemas, deployment configs, environment variables, developer setup
6. Write in clear, non-technical language when possible
7. Use markdown formatting with headers and bullet points
8. If the content is primarily code/technical, extract only the user-relevant parts
9. If very little user-facing content exists, note what the app does based on available information and keep it brief

Output a clean, helpful knowledge article that could be shown to end users seeking support.`;

  const userMessage = `Repository: ${repoInfo.owner}/${repoInfo.repo}
Description: ${repoInfo.description || 'No description'}
Language: ${repoInfo.language || 'Unknown'}
Topics: ${repoInfo.topics.join(', ') || 'None'}
Stars: ${repoInfo.stars}

Content:
${readmeContent || 'No content available.'}`;

  try {
    const response = await getClient().messages.create({
      // Haiku: fast + cheap. Switch to 'claude-sonnet-4-5-20250929' for higher quality summaries.
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
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

export async function fetchAndSummarizeRepo(
  url: string,
  token?: string,
  sources?: GitHubContentSources
): Promise<GitHubScrapeResult> {
  const { owner, repo } = parseGitHubUrl(url);
  const config = sources || DEFAULT_GITHUB_SOURCES;

  // Always fetch metadata; conditionally fetch content sources in parallel
  const fetchPromises: Promise<unknown>[] = [
    fetchRepoMetadata(owner, repo, token),
  ];
  const sourceKeys: string[] = ['metadata'];

  if (config.readme) {
    fetchPromises.push(fetchReadme(owner, repo, token));
    sourceKeys.push('readme');
  }
  if (config.wiki) {
    fetchPromises.push(fetchWikiContent(owner, repo, token));
    sourceKeys.push('wiki');
  }
  if (config.docs) {
    fetchPromises.push(fetchDocsFolder(owner, repo, token));
    sourceKeys.push('docs');
  }
  if (config.releases) {
    fetchPromises.push(fetchReleaseNotes(owner, repo, token));
    sourceKeys.push('releases');
  }

  const results = await Promise.all(fetchPromises);
  const repoInfo = results[0] as GitHubRepoInfo;

  // Build combined content from selected sources
  const contentSections: string[] = [];
  for (let i = 1; i < results.length; i++) {
    const content = results[i] as string;
    if (content) {
      const label = sourceKeys[i].toUpperCase();
      contentSections.push(`## [${label}]\n\n${content}`);
    }
  }

  const combinedContent = contentSections.join('\n\n---\n\n');

  if (!combinedContent && !repoInfo.description) {
    throw new Error('No content found for the selected sources. Try enabling additional content sources.');
  }

  const cappedContent = combinedContent.length > MAX_CHARS
    ? combinedContent.substring(0, MAX_CHARS) + '\n\n[Content truncated]'
    : combinedContent;

  const summary = await summarizeForUsers(cappedContent, repoInfo);

  return {
    title: repoInfo.description
      ? `${owner}/${repo} — ${repoInfo.description}`
      : `${owner}/${repo}`,
    content: summary,
    url: repoInfo.url,
    contentLength: summary.length,
  };
}
