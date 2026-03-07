'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearToken, User, Organization, createCheckoutSession, LimitReachedError } from '@/lib/api';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    href: '/knowledge',
    label: 'Knowledge Base',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    href: '/billing',
    label: 'Billing',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

interface SidebarProps {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  onSwitchOrg: (orgId: string) => void;
  onCreateOrg: (name: string) => Promise<void>;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, organizations, currentOrg, onSwitchOrg, onCreateOrg, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleSignOut = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-50 md:z-auto
        w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
        h-screen flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            SupportKit
          </Link>
          {/* Close button on mobile */}
          <button onClick={onClose} className="md:hidden p-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Organization Selector */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Organization</label>
          {limitReached ? (
            <div className="space-y-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Free plan allows 1 organization. Upgrade to Pro for unlimited.
              </p>
              <button
                onClick={async () => {
                  setUpgradeLoading(true);
                  try {
                    const { url } = await createCheckoutSession();
                    window.location.href = url;
                  } catch {
                    // fallback to billing page
                    window.location.href = '/billing';
                  } finally {
                    setUpgradeLoading(false);
                  }
                }}
                disabled={upgradeLoading}
                className="w-full h-8 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </button>
              <button
                onClick={() => { setLimitReached(false); setIsCreating(false); setNewOrgName(''); }}
                className="w-full h-8 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          ) : isCreating ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newOrgName.trim()) return;
                setCreateLoading(true);
                try {
                  await onCreateOrg(newOrgName.trim());
                  setNewOrgName('');
                  setIsCreating(false);
                } catch (err: unknown) {
                  if (err instanceof LimitReachedError) {
                    setLimitReached(true);
                  }
                } finally {
                  setCreateLoading(false);
                }
              }}
              className="space-y-2"
            >
              <input
                autoFocus
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Organization name"
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={createLoading}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createLoading || !newOrgName.trim()}
                  className="flex-1 h-8 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setNewOrgName(''); }}
                  disabled={createLoading}
                  className="flex-1 h-8 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {organizations.length > 0 && (
                <select
                  value={currentOrg?.id || ''}
                  onChange={(e) => onSwitchOrg(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setIsCreating(true)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 h-8 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Organization
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {/* Divider + Home & Contact links */}
          <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-700 space-y-1">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Home Page
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </Link>
          </div>
        </nav>

        {/* User info & Sign Out */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4">
          {user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
