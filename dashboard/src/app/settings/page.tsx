'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { UpgradeModal } from '@/components/UpgradeModal';
import {
  getCurrentOrgId,
  getOrganizations,
  createOrganization,
  clearToken,
  getGitHubStatus,
  connectGitHub,
  disconnectGitHub,
  Organization,
  LimitReachedError,
} from '@/lib/api';

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [copied, setCopied] = useState(false);
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [githubLoading, setGithubLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const loadGitHubStatus = useCallback(async () => {
    try {
      const status = await getGitHubStatus();
      setGithubConnected(status.connected);
      setGithubUsername(status.username || '');
    } catch {
      // Not critical
    } finally {
      setGithubLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
    loadGitHubStatus();
  }, [loadGitHubStatus]);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;

    // Clear the query params
    router.replace('/settings');

    (async () => {
      try {
        const result = await connectGitHub(code);
        setGithubConnected(result.connected);
        setGithubUsername(result.username || '');
      } catch (err) {
        console.error('GitHub connect failed:', err);
      }
    })();
  }, [searchParams, router]);

  async function loadOrganizations() {
    try {
      const { organizations } = await getOrganizations();
      setOrganizations(organizations);

      const currentOrgId = getCurrentOrgId();
      const org = organizations.find(o => o.id === currentOrgId) || organizations[0];
      setCurrentOrg(org);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  }

  function copyApiKey() {
    if (currentOrg) {
      navigator.clipboard.writeText(currentOrg.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function maskApiKey(key: string) {
    if (key.length < 20) return key;
    return key.slice(0, 12) + '...' + key.slice(-8);
  }

  function handleConnectGitHub() {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/settings`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
  }

  async function handleDisconnectGitHub() {
    setDisconnecting(true);
    try {
      await disconnectGitHub();
      setGithubConnected(false);
      setGithubUsername('');
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      await createOrganization(newOrgName);
      setShowNewOrgModal(false);
      setNewOrgName('');
      await loadOrganizations();
    } catch (error) {
      if (error instanceof LimitReachedError) {
        setShowNewOrgModal(false);
        setShowUpgrade(true);
      } else {
        console.error('Failed to create organization:', error);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Manage your SupportKit configuration</p>
      </div>

      <div className="space-y-6">
        {/* Organizations Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">Organizations</h2>
            <button
              onClick={() => setShowNewOrgModal(true)}
              className="h-8 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {organizations.map((org) => (
              <div
                key={org.id}
                className={`px-6 py-4 flex justify-between items-center ${
                  org.id === currentOrg?.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{org.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                    {maskApiKey(org.apiKey)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(org.apiKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="h-8 px-3 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Copy Key
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Current API Key Section */}
        {currentOrg && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">API Key</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                Use this key to authenticate your iOS app with SupportKit.
              </p>

              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 px-4 py-2.5 rounded-lg font-mono text-sm text-gray-700 dark:text-slate-300">
                  {maskApiKey(currentOrg.apiKey)}
                </code>
                <button
                  onClick={copyApiKey}
                  className="h-10 px-4 bg-gray-900 dark:bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-slate-500 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <p className="text-gray-400 dark:text-slate-500 text-xs mt-3">
                Keep this key secret. Do not share it publicly or commit it to version control.
              </p>
            </div>
          </div>
        )}

        {/* iOS Integration */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">iOS Integration</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
              Add SupportKit to your iOS app with Swift Package Manager.
            </p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium flex items-center justify-center">1</span>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Add the package to your Xcode project</h3>
                </div>
                <code className="block bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 px-4 py-2.5 rounded-lg font-mono text-sm text-gray-700 dark:text-slate-300">
                  https://github.com/Babu12345/SupportKit
                </code>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium flex items-center justify-center">2</span>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Configure SupportKit in your app</h3>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`import SupportKit

// In your App init or AppDelegate
SupportKit.configure(apiKey: "${currentOrg ? maskApiKey(currentOrg.apiKey) : 'YOUR_API_KEY'}")`}
                </pre>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium flex items-center justify-center">3</span>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Present the chat view</h3>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`// UIKit
SupportKit.presentChat(from: viewController)

// SwiftUI
.sheet(isPresented: $showChat) {
    SupportKit.chatView()
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Connected Accounts</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white dark:text-gray-900" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">GitHub</h3>
                  {githubLoading ? (
                    <p className="text-gray-400 dark:text-slate-500 text-sm">Loading...</p>
                  ) : githubConnected ? (
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      Connected as <span className="font-medium">{githubUsername}</span>
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                      Connect to import knowledge from private repos
                    </p>
                  )}
                </div>
              </div>
              {!githubLoading && (
                githubConnected ? (
                  <button
                    onClick={handleDisconnectGitHub}
                    disabled={disconnecting}
                    className="h-9 px-4 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGitHub}
                    className="h-9 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Connect
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50">
            <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Sign Out</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                Sign out of the dashboard on this device
              </p>
            </div>
            <button
              onClick={() => {
                clearToken();
                window.location.href = '/login';
              }}
              className="h-9 px-4 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* New Organization Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
            <form onSubmit={handleCreateOrg}>
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New Organization
                </h2>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="My App"
                  className="w-full h-10 px-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="h-9 px-4 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} limitType="organizations" />
    </DashboardLayout>
  );
}
