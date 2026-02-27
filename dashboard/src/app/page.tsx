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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your SupportKit integration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? '...' : sources.length}
          </div>
          <div className="text-gray-600">Knowledge Sources</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-2xl font-bold text-gray-900">-</div>
          <div className="text-gray-600">Conversations (Coming soon)</div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-900">-</div>
          <div className="text-gray-600">Resolution Rate (Coming soon)</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl">1️⃣</div>
            <div>
              <h3 className="font-medium text-gray-900">Add Knowledge</h3>
              <p className="text-gray-600 text-sm">
                Add FAQs, help articles, or documentation to train your AI assistant.
              </p>
              <Link
                href="/knowledge"
                className="text-blue-600 text-sm hover:underline mt-1 inline-block"
              >
                Go to Knowledge Base →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl">2️⃣</div>
            <div>
              <h3 className="font-medium text-gray-900">Get Your API Key</h3>
              <p className="text-gray-600 text-sm">
                Copy your API key to integrate SupportKit into your app.
              </p>
              <Link
                href="/settings"
                className="text-blue-600 text-sm hover:underline mt-1 inline-block"
              >
                View Settings →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl">3️⃣</div>
            <div>
              <h3 className="font-medium text-gray-900">Integrate SDK</h3>
              <p className="text-gray-600 text-sm">Add 3 lines of code to your iOS app:</p>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded mt-2 text-xs overflow-x-auto">
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
