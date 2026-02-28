'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken,
  getCurrentUser,
  createOrganization,
  setCurrentOrgId,
  getCurrentOrgId,
  Organization,
  User
} from '@/lib/api';

interface AuthState {
  isLoading: boolean;
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  switchOrganization: (orgId: string) => void;
  handleCreateOrg: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
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
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const switchOrganization = useCallback((orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      setCurrentOrgId(orgId);
      window.location.reload();
    }
  }, [organizations]);

  const handleCreateOrg = useCallback(async (name: string) => {
    const newOrg = await createOrganization(name);
    setOrganizations(prev => [...prev, newOrg]);
    setCurrentOrg(newOrg);
    setCurrentOrgId(newOrg.id);
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoading,
      user,
      organizations,
      currentOrg,
      switchOrganization,
      handleCreateOrg,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
