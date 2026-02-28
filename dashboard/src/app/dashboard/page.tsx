'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/components/AuthContext';
import { getKnowledgeSources, getUsageStats, KnowledgeSource, UsageStats } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentOrg } = useAuth();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [knowledgeData, usageData] = await Promise.all([
          getKnowledgeSources(),
          getUsageStats(currentOrg?.id),
        ]);
        setSources(knowledgeData.sources);
        setStats(usageData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentOrg?.id]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Overview of your SupportKit integration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '-' : sources.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Knowledge Sources</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '-' : stats ? stats.conversations.used : '-'}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Conversations This Month</div>
            </div>
          </div>
          {stats && stats.conversations.orgUsed != null && (
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {stats.conversations.orgUsed} from {currentOrg?.name || 'this org'}
            </p>
          )}
          {stats && stats.conversations.limit != null && stats.conversations.limit !== Infinity && (
            <p className="text-xs text-gray-400 dark:text-slate-500">
              {stats.conversations.remaining} of {stats.conversations.limit} remaining
            </p>
          )}
          {stats?.tier === 'pro' && (
            <p className="text-xs text-gray-400 dark:text-slate-500">Unlimited on Pro</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? '-' : stats?.tier === 'pro' ? 'Pro' : 'Free'}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Current Plan</div>
            </div>
          </div>
          {stats?.tier !== 'pro' && (
            <Link href="/billing" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Upgrade</Link>
          )}
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Quick Start</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          <div className="flex items-start gap-4 p-4 md:p-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Add Knowledge</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                Add FAQs, help articles, or documentation to train your AI assistant.
              </p>
              <Link
                href="/knowledge"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mt-2 inline-block"
              >
                Go to Knowledge Base
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 md:p-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Get Your API Key</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                Copy your API key to integrate SupportKit into your app.
              </p>
              <Link
                href="/settings"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mt-2 inline-block"
              >
                View Settings
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3 md:gap-4 p-4 md:p-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm shrink-0">
              3
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white">Install the Package</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                Add SupportKit via Swift Package Manager:
              </p>
              <div className="text-sm text-gray-600 dark:text-slate-300 mt-2 space-y-1.5">
                <p>1. In Xcode, go to <span className="font-medium text-gray-900 dark:text-white">File &rarr; Add Package Dependencies</span></p>
                <p>2. Paste the repository URL:</p>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 px-3 py-2.5 max-w-full">
                <div className="min-w-0 overflow-x-auto">
                  <code className="text-xs font-mono text-gray-800 dark:text-slate-200 whitespace-nowrap">
                    https://github.com/Babu12345/SupportKit
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://github.com/Babu12345/SupportKit');
                    const btn = document.getElementById('copy-url-btn');
                    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
                  }}
                  id="copy-url-btn"
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium shrink-0 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1.5">
                3. Select the latest version and click <span className="font-medium text-gray-900 dark:text-white">Add Package</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 md:p-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Integrate SDK</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Add a few lines of code to your iOS app:</p>

              {/* UIKit */}
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-700 dark:border-slate-600 max-w-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-slate-700 border-b border-gray-700 dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-400 dark:text-slate-400">UIKit</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`import SupportKit\n\nSupportKit.configure(\n    apiKey: "your-api-key"\n)\nSupportKit.presentChat(\n    from: viewController\n)`);
                      const btn = document.getElementById('copy-uikit-btn');
                      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
                    }}
                    id="copy-uikit-btn"
                    className="text-xs text-gray-400 dark:text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700 dark:hover:bg-slate-600"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 dark:bg-slate-800 p-4 text-sm leading-relaxed overflow-x-auto">
                  <code>
                    <span className="text-pink-400">import</span><span className="text-gray-100"> SupportKit</span>{'\n'}
                    {'\n'}
                    <span className="text-gray-100">SupportKit</span><span className="text-gray-400">.</span><span className="text-blue-400">configure</span><span className="text-gray-400">(</span>{'\n'}
                    <span className="text-gray-100">    apiKey</span><span className="text-gray-400">: </span><span className="text-green-400">&quot;your-api-key&quot;</span>{'\n'}
                    <span className="text-gray-400">)</span>{'\n'}
                    <span className="text-gray-100">SupportKit</span><span className="text-gray-400">.</span><span className="text-blue-400">presentChat</span><span className="text-gray-400">(</span>{'\n'}
                    <span className="text-gray-100">    from</span><span className="text-gray-400">: </span><span className="text-gray-100">viewController</span>{'\n'}
                    <span className="text-gray-400">)</span>
                  </code>
                </pre>
              </div>

              {/* SwiftUI */}
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-700 dark:border-slate-600 max-w-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-slate-700 border-b border-gray-700 dark:border-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-400 dark:text-slate-400">SwiftUI</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`import SupportKit\n\nSupportKit.configure(\n    apiKey: "your-api-key"\n)\n.sheet(isPresented: $showChat) {\n    SupportKit.chatView()\n}`);
                      const btn = document.getElementById('copy-swiftui-btn');
                      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
                    }}
                    id="copy-swiftui-btn"
                    className="text-xs text-gray-400 dark:text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700 dark:hover:bg-slate-600"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 dark:bg-slate-800 p-4 text-sm leading-relaxed overflow-x-auto">
                  <code>
                    <span className="text-pink-400">import</span><span className="text-gray-100"> SupportKit</span>{'\n'}
                    {'\n'}
                    <span className="text-gray-100">SupportKit</span><span className="text-gray-400">.</span><span className="text-blue-400">configure</span><span className="text-gray-400">(</span>{'\n'}
                    <span className="text-gray-100">    apiKey</span><span className="text-gray-400">: </span><span className="text-green-400">&quot;your-api-key&quot;</span>{'\n'}
                    <span className="text-gray-400">)</span>{'\n'}
                    <span className="text-gray-400">.</span><span className="text-blue-400">sheet</span><span className="text-gray-400">(</span><span className="text-gray-100">isPresented</span><span className="text-gray-400">: </span><span className="text-gray-100">$showChat</span><span className="text-gray-400">)</span><span className="text-gray-100"> </span><span className="text-gray-400">{'{'}</span>{'\n'}
                    <span className="text-gray-100">    SupportKit</span><span className="text-gray-400">.</span><span className="text-blue-400">chatView</span><span className="text-gray-400">()</span>{'\n'}
                    <span className="text-gray-400">{'}'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
