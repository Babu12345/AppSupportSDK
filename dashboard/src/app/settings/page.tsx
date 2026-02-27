'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  getCurrentOrgId,
  getOrganizations,
  createOrganization,
  clearToken,
  Organization,
} from '@/lib/api';

export default function SettingsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [copied, setCopied] = useState(false);
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

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
      console.error('Failed to create organization:', error);
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
    </DashboardLayout>
  );
}
