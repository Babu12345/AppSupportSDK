'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import {
  getToken,
  getCurrentUser,
  getOrganizations,
  setCurrentOrgId,
  getCurrentOrgId,
  Organization,
  User
} from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  switchOrganization: (orgId: string) => void;
}

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

        // Set current org
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
      window.location.reload(); // Refresh to load new org data
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
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
