'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('apiKey') || '';
    setApiKey(key);
  }, []);

  function copyApiKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function maskApiKey(key: string) {
    if (key.length < 20) return key;
    return key.slice(0, 12) + '...' + key.slice(-8);
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your SupportKit configuration</p>
      </div>

      <div className="space-y-6">
        {/* API Key Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key</h2>
          <p className="text-gray-600 mb-4">
            Use this key to authenticate your iOS app with SupportKit.
          </p>

          <div className="flex items-center gap-3">
            <code className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm">
              {maskApiKey(apiKey)}
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
SupportKit.configure(apiKey: "${maskApiKey(apiKey)}")`}
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
                localStorage.removeItem('apiKey');
                window.location.href = '/login';
              }}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
