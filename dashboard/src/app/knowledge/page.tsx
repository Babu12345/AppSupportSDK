'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useRouter } from 'next/navigation';
import {
  getKnowledgeSources,
  createKnowledgeSource,
  updateKnowledgeSource,
  deleteKnowledgeSource,
  scrapeUrlPreview,
  scrapeGitHubPreview,
  refreshKnowledgeSource,
  getGitHubStatus,
  getGitHubRepos,
  KnowledgeSource,
  GitHubRepo,
  GitHubContentSources,
  LimitReachedError,
} from '@/lib/api';

export default function KnowledgePage() {
  const router = useRouter();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [sourceMode, setSourceMode] = useState<'manual' | 'url' | 'github'>('manual');
  const [summarizing, setSummarizing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  // GitHub repo picker state
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [githubSources, setGithubSources] = useState<GitHubContentSources>({
    readme: true,
    wiki: false,
    docs: false,
    releases: false,
  });

  useEffect(() => {
    loadSources();
  }, []);

  // Check GitHub status when switching to GitHub mode
  useEffect(() => {
    if (sourceMode === 'github' && githubConnected === null) {
      checkGitHubStatus();
    }
  }, [sourceMode]);

  // Debounced repo search
  useEffect(() => {
    if (sourceMode !== 'github' || !githubConnected) return;
    const timer = setTimeout(() => {
      loadGitHubRepos(repoSearch || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [repoSearch, sourceMode, githubConnected]);


  async function loadSources() {
    try {
      const data = await getKnowledgeSources();
      setSources(data.sources);
    } catch (error) {
      console.error('Failed to load sources:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingSource(null);
    setFormData({ title: '', content: '' });
    setSourceMode('manual');
    setUrlInput('');
    setScrapeError('');
    setError('');
    setSelectedRepo(null);
    setRepoSearch('');
    setGithubRepos([]);
    setGithubSources({ readme: true, wiki: false, docs: false, releases: false });
    setShowModal(true);
  }

  function openEditModal(source: KnowledgeSource) {
    setEditingSource(source);
    setFormData({ title: source.title, content: source.content });
    setSourceMode(source.sourceType === 'github' ? 'github' : source.sourceType === 'url' ? 'url' : 'manual');
    setUrlInput(source.sourceUrl || '');
    setScrapeError('');
    setError('');
    if (source.sourceType === 'github' && source.sourceConfig) {
      try {
        const parsed = JSON.parse(source.sourceConfig);
        setGithubSources({
          readme: parsed.readme !== false,
          wiki: parsed.wiki === true,
          docs: parsed.docs === true,
          releases: parsed.releases === true,
        });
      } catch {
        setGithubSources({ readme: true, wiki: false, docs: false, releases: false });
      }
    } else {
      setGithubSources({ readme: true, wiki: false, docs: false, releases: false });
    }
    setShowModal(true);
  }

  async function handleScrape() {
    if (!urlInput.trim()) return;
    setScraping(true);
    setScrapeError('');

    try {
      const result = await scrapeUrlPreview(urlInput.trim());
      setFormData({ title: result.title, content: result.content });
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : 'Failed to fetch URL content');
    } finally {
      setScraping(false);
    }
  }

  async function loadGitHubRepos(query?: string) {
    setLoadingRepos(true);
    try {
      const data = await getGitHubRepos(query);
      setGithubRepos(data.repos);
    } catch {
      setGithubRepos([]);
    } finally {
      setLoadingRepos(false);
    }
  }

  async function checkGitHubStatus() {
    try {
      const status = await getGitHubStatus();
      setGithubConnected(status.connected);
      if (status.connected) {
        loadGitHubRepos();
      }
    } catch {
      setGithubConnected(false);
    }
  }

  async function handleRepoSelect(repo: GitHubRepo) {
    setSelectedRepo(repo);
    setUrlInput(repo.url);
    setSummarizing(true);
    setScrapeError('');

    try {
      const result = await scrapeGitHubPreview(repo.url, githubSources);
      setFormData({ title: result.title, content: result.content });
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : 'Failed to fetch GitHub repository');
    } finally {
      setSummarizing(false);
    }
  }

  async function handleRefresh(id: string) {
    setRefreshingId(id);
    try {
      await refreshKnowledgeSource(id);
      await loadSources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingSource) {
        await updateKnowledgeSource(editingSource.id, {
          ...formData,
          sourceType: sourceMode,
          sourceUrl: sourceMode !== 'manual' ? urlInput.trim() : undefined,
          sourceConfig: sourceMode === 'github' ? githubSources : undefined,
        });
      } else {
        await createKnowledgeSource({
          ...formData,
          sourceType: sourceMode,
          sourceUrl: sourceMode !== 'manual' ? urlInput.trim() : undefined,
          sourceConfig: sourceMode === 'github' ? githubSources : undefined,
        });
      }
      setShowModal(false);
      await loadSources();
    } catch (err) {
      if (err instanceof LimitReachedError) {
        setShowModal(false);
        setShowUpgrade(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this knowledge source?')) return;

    try {
      await deleteKnowledgeSource(id);
      await loadSources();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Add content to train your AI support assistant
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="h-10 px-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Knowledge
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : sources.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No knowledge sources yet
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            Add FAQs, help articles, or documentation to get started
          </p>
          <button
            onClick={openCreateModal}
            className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Knowledge Source
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm divide-y divide-gray-200 dark:divide-slate-700">
          {sources.map((source) => (
            <div
              key={source.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {source.title}
                    </h3>
                    {source.sourceType === 'url' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        URL
                      </span>
                    )}
                    {source.sourceType === 'github' && (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                          </svg>
                          GitHub
                        </span>
                        {source.sourceConfig && (() => {
                          try {
                            const cfg = JSON.parse(source.sourceConfig!);
                            const labels: string[] = [];
                            if (cfg.readme) labels.push('README');
                            if (cfg.wiki) labels.push('Wiki');
                            if (cfg.docs) labels.push('Docs');
                            if (cfg.releases) labels.push('Releases');
                            return labels.length > 1 ? (
                              <span className="text-xs text-gray-400 dark:text-slate-500">
                                ({labels.join(', ')})
                              </span>
                            ) : null;
                          } catch { return null; }
                        })()}
                      </>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                    {source.content}
                  </p>
                  {['url', 'github'].includes(source.sourceType) && source.sourceUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={source.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 dark:text-blue-400 text-xs hover:underline truncate max-w-xs"
                      >
                        {source.sourceUrl}
                      </a>
                      <button
                        onClick={() => handleRefresh(source.id)}
                        disabled={refreshingId === source.id}
                        className="text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors disabled:opacity-50"
                        title="Re-fetch content from URL"
                      >
                        <svg className={`w-3.5 h-3.5 ${refreshingId === source.id ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-gray-400 dark:text-slate-500 text-xs mt-2">
                    Added {new Date(source.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => openEditModal(source)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingSource ? 'Edit Knowledge Source' : 'Add Knowledge Source'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Source type toggle */}
                <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSourceMode('manual')}
                      className={`flex-1 h-9 text-sm font-medium rounded-lg border transition-colors ${
                        sourceMode === 'manual'
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceMode('url')}
                      className={`flex-1 h-9 text-sm font-medium rounded-lg border transition-colors ${
                        sourceMode === 'url'
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      From URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceMode('github')}
                      className={`flex-1 h-9 text-sm font-medium rounded-lg border transition-colors ${
                        sourceMode === 'github'
                          ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                          : 'border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      GitHub
                    </button>
                  </div>

                {/* URL input */}
                {sourceMode === 'url' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/help/getting-started"
                        className="flex-1 h-10 px-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleScrape}
                        disabled={scraping || !urlInput.trim()}
                        className="h-10 px-4 bg-gray-800 dark:bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-gray-900 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {scraping ? 'Fetching...' : 'Fetch'}
                      </button>
                    </div>
                    {scrapeError && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{scrapeError}</p>
                    )}
                  </div>
                )}

                {/* GitHub repo picker */}
                {sourceMode === 'github' && (
                  <div className="space-y-3">
                    {githubConnected === null ? (
                      <div className="flex items-center justify-center py-6">
                        <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : !githubConnected ? (
                      <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-6 text-center">
                        <svg className="w-8 h-8 mx-auto mb-3 text-gray-400 dark:text-slate-500" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                          Connect your GitHub account to browse and import repositories.
                        </p>
                        <button
                          type="button"
                          onClick={() => { setShowModal(false); router.push('/settings'); }}
                          className="h-9 px-4 bg-gray-900 dark:bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-black dark:hover:bg-slate-500 transition-colors"
                        >
                          Connect GitHub in Settings
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Search input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Search Repositories
                          </label>
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              value={repoSearch}
                              onChange={(e) => setRepoSearch(e.target.value)}
                              placeholder="Search your repos..."
                              className="w-full h-10 pl-10 pr-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Repo list */}
                        <div className="border border-gray-200 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                          {loadingRepos ? (
                            <div className="flex items-center justify-center py-6">
                              <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          ) : githubRepos.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">
                              {repoSearch ? 'No repos found' : 'No repositories'}
                            </p>
                          ) : (
                            githubRepos.map((repo) => (
                              <button
                                key={repo.fullName}
                                type="button"
                                onClick={() => handleRepoSelect(repo)}
                                disabled={summarizing}
                                className={`w-full text-left px-3 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0 disabled:opacity-50 ${
                                  selectedRepo?.fullName === repo.fullName ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <img src={repo.ownerAvatar} alt="" className="w-5 h-5 rounded-full" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{repo.fullName}</span>
                                  {repo.private && (
                                    <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  )}
                                  {repo.language && (
                                    <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{repo.language}</span>
                                  )}
                                </div>
                                {repo.description && (
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1 pl-7">{repo.description}</p>
                                )}
                              </button>
                            ))
                          )}
                        </div>

                        <p className="text-gray-400 dark:text-slate-500 text-xs">
                          Don&apos;t see a repo?{' '}
                          <a
                            href="https://github.com/apps/appsupportsdk/installations/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 underline"
                          >
                            Update repository access
                          </a>
                          {' '}on GitHub.
                        </p>

                        {/* Content source toggles */}
                        <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Content to include
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              { key: 'readme' as const, label: 'README' },
                              { key: 'wiki' as const, label: 'Wiki Pages' },
                              { key: 'docs' as const, label: 'Docs Folder' },
                              { key: 'releases' as const, label: 'Release Notes' },
                            ]).map(({ key, label }) => (
                              <label
                                key={key}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                  githubSources[key]
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                                    : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={githubSources[key]}
                                  onChange={(e) =>
                                    setGithubSources((prev) => ({ ...prev, [key]: e.target.checked }))
                                  }
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>
                              </label>
                            ))}
                          </div>
                          {!githubSources.readme && !githubSources.wiki &&
                           !githubSources.docs && !githubSources.releases && (
                            <p className="text-red-500 text-xs mt-1">Select at least one content source</p>
                          )}
                        </div>

                        {/* Re-summarize button */}
                        {selectedRepo && formData.content && !summarizing && (
                          <button
                            type="button"
                            onClick={() => handleRepoSelect(selectedRepo)}
                            disabled={!githubSources.readme && !githubSources.wiki &&
                                      !githubSources.docs && !githubSources.releases}
                            className="w-full h-9 text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                          >
                            Re-summarize with selected sources
                          </button>
                        )}

                        {/* Selected repo indicator */}
                        {selectedRepo && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className={`w-4 h-4 ${summarizing ? 'animate-spin text-purple-600' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {summarizing ? (
                                <>
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </>
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              )}
                            </svg>
                            <span className="text-gray-600 dark:text-slate-300">
                              {summarizing ? `Summarizing ${selectedRepo.fullName}...` : `${selectedRepo.fullName} — ready to save`}
                            </span>
                          </div>
                        )}

                        {scrapeError && (
                          <p className="text-red-500 dark:text-red-400 text-sm">{scrapeError}</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., How to reset password"
                    className="w-full h-10 px-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter the knowledge content here. This can be FAQ answers, help documentation, product information, etc."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSource ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} limitType="knowledge" />
    </DashboardLayout>
  );
}
