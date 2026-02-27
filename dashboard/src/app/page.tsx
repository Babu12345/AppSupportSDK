'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getKnowledgeSources, KnowledgeSource } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKnowledgeSources();
        setSources(data.sources);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your SupportKit integration</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '-' : sources.length}
              </div>
              <div className="text-sm text-gray-500">Knowledge Sources</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-sm text-gray-500">Conversations</div>
            </div>
          </div>
          <p className="text-xs text-gray-400">Coming soon</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-sm text-gray-500">Resolution Rate</div>
            </div>
          </div>
          <p className="text-xs text-gray-400">Coming soon</p>
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Quick Start</h2>
        </div>

        <div className="divide-y">
          <div className="flex items-start gap-4 p-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Add Knowledge</h3>
              <p className="text-gray-500 text-sm mt-1">
                Add FAQs, help articles, or documentation to train your AI assistant.
              </p>
              <Link
                href="/knowledge"
                className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block"
              >
                Go to Knowledge Base
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Get Your API Key</h3>
              <p className="text-gray-500 text-sm mt-1">
                Copy your API key to integrate SupportKit into your app.
              </p>
              <Link
                href="/settings"
                className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block"
              >
                View Settings
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Integrate SDK</h3>
              <p className="text-gray-500 text-sm mt-1">Add a few lines of code to your iOS app:</p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mt-3 text-sm overflow-x-auto">
{`import SupportKit

SupportKit.configure(apiKey: "your-api-key")
SupportKit.presentChat(from: viewController)`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
