'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuth } from './AuthContext';
import { getToken } from '@/lib/api';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, user, organizations, currentOrg, switchOrganization, handleCreateOrg, refreshAuth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      const token = getToken();
      if (token) {
        // Token exists but user not loaded yet (e.g. after login redirect)
        refreshAuth();
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, user, router, refreshAuth]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Skeleton sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 h-screen">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-700">
            <div className="h-6 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-9 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </aside>
        {/* Skeleton content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar
        user={user}
        organizations={organizations}
        currentOrg={currentOrg}
        onSwitchOrg={switchOrganization}
        onCreateOrg={handleCreateOrg}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-bold text-gray-900 dark:text-white">SupportKit</span>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
