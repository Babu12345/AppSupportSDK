'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearToken, User, Organization } from '@/lib/api';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/knowledge', label: 'Knowledge Base', icon: '📚' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  onSwitchOrg: (orgId: string) => void;
}

export function Sidebar({ user, organizations, currentOrg, onSwitchOrg }: SidebarProps) {
  const pathname = usePathname();

  const handleSignOut = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold">SupportKit</h1>
        <p className="text-gray-400 text-sm">Dashboard</p>
      </div>

      {/* Organization Selector */}
      {organizations.length > 0 && (
        <div className="mb-6">
          <label className="block text-xs text-gray-400 mb-1">Organization</label>
          <select
            value={currentOrg?.id || ''}
            onChange={(e) => onSwitchOrg(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User info & Sign Out */}
      <div className="border-t border-gray-800 pt-4 mt-4">
        {user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium truncate">{user.name || user.email}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left text-sm"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
