'use client';

import { useState } from 'react';
import { createCheckoutSession } from '@/lib/api';
import { PRO_FEATURES, PRO_PRICE } from '@/lib/plans';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  limitType?: 'conversations' | 'organizations' | 'knowledge';
  hasUsedTrial?: boolean;
}

const limitMessages: Record<string, string> = {
  conversations: "You've reached your monthly conversation limit.",
  organizations: "You've reached your organization limit.",
  knowledge: "You've reached your knowledge article limit.",
};

export function UpgradeModal({ open, onClose, limitType, hasUsedTrial }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upgrade to Pro</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Limit message */}
          {limitType && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {limitMessages[limitType] || "You've hit a plan limit."}
              </p>
            </div>
          )}

          {/* Features */}
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Unlock everything with Pro for just {PRO_PRICE}/month:
          </p>
          <ul className="space-y-2 mb-6">
            {PRO_FEATURES.filter(f => !hasUsedTrial || !f.includes('trial')).map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 h-10 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : hasUsedTrial ? 'Upgrade to Pro' : 'Start Free Trial'}
            </button>
            <button
              onClick={onClose}
              className="h-10 px-4 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
