'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import {
  getToken,
  getCurrentUser,
  setCurrentOrgId,
  getCurrentOrgId,
  Organization,
  User
} from '@/lib/api';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const { user, organizations } = await getCurrentUser();
        setUser(user);
        setOrganizations(organizations);

        const savedOrgId = getCurrentOrgId();
        const org = organizations.find(o => o.id === savedOrgId) || organizations[0];
        if (org) {
          setCurrentOrg(org);
          setCurrentOrgId(org.id);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      setCurrentOrgId(orgId);
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar
        user={user}
        organizations={organizations}
        currentOrg={currentOrg}
        onSwitchOrg={switchOrganization}
      />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
