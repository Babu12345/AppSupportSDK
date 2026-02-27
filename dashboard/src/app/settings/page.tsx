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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your SupportKit configuration</p>
      </div>

      <div className="space-y-6">
        {/* Organizations Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Organizations</h2>
            <button
              onClick={() => setShowNewOrgModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              + New Organization
            </button>
          </div>

          <div className="space-y-3">
            {organizations.map((org) => (
              <div
                key={org.id}
                className={`p-4 rounded-lg border ${
                  org.id === currentOrg?.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      {maskApiKey(org.apiKey)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(org.apiKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Copy Key
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current API Key Section */}
        {currentOrg && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current API Key
            </h2>
            <p className="text-gray-600 mb-4">
              Use this key to authenticate your iOS app with SupportKit.
            </p>

            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm">
                {maskApiKey(currentOrg.apiKey)}
              </code>
              <button
                onClick={copyApiKey}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-3">
              Keep this key secret. Do not share it publicly or commit it to version control.
            </p>
          </div>
        )}

        {/* iOS Integration */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            iOS Integration
          </h2>
          <p className="text-gray-600 mb-4">
            Add SupportKit to your iOS app with Swift Package Manager.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                1. Add the package to your Xcode project
              </h3>
              <code className="block bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm">
                https://github.com/Babu12345/AppSupportSDK
              </code>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                2. Configure SupportKit in your app
              </h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`import SupportKit

// In your App init or AppDelegate
SupportKit.configure(apiKey: "${currentOrg ? maskApiKey(currentOrg.apiKey) : 'YOUR_API_KEY'}")`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                3. Present the chat view
              </h3>
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

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow p-6 border-2 border-red-100">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Sign Out</h3>
              <p className="text-gray-600 text-sm">
                Sign out of the dashboard on this device
              </p>
            </div>
            <button
              onClick={() => {
                clearToken();
                window.location.href = '/login';
              }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* New Organization Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <form onSubmit={handleCreateOrg}>
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Organization
                </h2>
              </div>

              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="My App"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
