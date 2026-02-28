'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getUsageStats, createCheckoutSession, createPortalSession, UsageStats } from '@/lib/api';
import { PRO_FEATURES, PRO_PRICE } from '@/lib/plans';
import Link from 'next/link';

export default function BillingPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getUsageStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const isPro = stats?.tier === 'pro';
  const conversationPercent = stats && stats.conversations.limit !== Infinity
    ? Math.min(100, Math.round((stats.conversations.used / stats.conversations.limit) * 100))
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-xl" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className={`border rounded-xl p-6 ${
              isPro
                ? 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    {isPro ? 'You have access to all Pro features.' : 'You are on the free plan.'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isPro
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                }`}>
                  {isPro ? 'Pro' : 'Free'}
                </span>
              </div>

              {isPro ? (
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading}
                  className="h-10 px-5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Manage Billing
                </button>
              ) : (
                <>
                  <ul className="space-y-2 mb-4">
                    {PRO_FEATURES.filter(f => !stats?.hasUsedTrial || !f.includes('trial')).map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleUpgrade}
                    disabled={actionLoading}
                    className="h-10 px-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {stats?.hasUsedTrial ? `Upgrade to Pro — ${PRO_PRICE}/month` : 'Start Free Trial'}
                  </button>
                </>
              )}
            </div>

            {/* Usage */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage This Month</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-slate-300">AI Conversations</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.conversations.used}
                      {stats.conversations.limit === Infinity ? '' : ` / ${stats.conversations.limit}`}
                    </span>
                  </div>
                  {!isPro && (
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          conversationPercent >= 90 ? 'bg-red-500' : conversationPercent >= 70 ? 'bg-yellow-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${conversationPercent}%` }}
                      />
                    </div>
                  )}
                  {isPro && (
                    <p className="text-xs text-gray-500 dark:text-slate-400">Unlimited on Pro plan</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-slate-300">Organizations</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isPro ? 'Unlimited' : `Up to ${stats.limits.maxOrganizations}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-slate-300">Knowledge Articles (per org)</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {isPro ? 'Unlimited' : `Up to ${stats.limits.maxKnowledgeSources}`}
                  </span>
                </div>
              </div>

              {!isPro && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-4">
                  Usage resets on the 1st of each month.{' '}
                  <Link href="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline">View plans</Link>
                </p>
              )}
            </div>

          </div>
        ) : (
          <p className="text-gray-500 dark:text-slate-400">Failed to load billing information.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
