"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, UserRole, AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  hasRole: (roles: UserRole[]) => boolean;
  isStaff: () => boolean;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const mapToAuthUser = useCallback((user: User, profile: Profile): AuthUser => ({
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url || undefined,
    department: profile.department || undefined,
  }), []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user?.id) return;

    const profile = await fetchProfile(state.user.id);
    if (profile) {
      setState(prev => ({
        ...prev,
        profile,
        user: prev.user ? mapToAuthUser({ id: prev.user.id, email: prev.user.email } as User, profile) : null,
      }));
    }
  }, [state.user?.id, fetchProfile, mapToAuthUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setState({
            user: mapToAuthUser(session.user, profile),
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setState({
            user: mapToAuthUser(session.user, profile),
            profile,
            isLoading: false,
            isAuthenticated: true,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, mapToAuthUser]);

  const login = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.refresh();
    }

    return { error };
  }, [router]);

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }, [router]);

  const register = useCallback(async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { error };
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.profile) return false;
    return roles.includes(state.profile.role as UserRole);
  }, [state.profile]);

  const isStaff = useCallback((): boolean => {
    if (!state.profile) return false;
    const staffRoles: UserRole[] = [
      'super_admin',
      'operations_manager',
      'logistics_coordinator',
      'driver',
      'warehouse_staff',
      'customer_support',
      'viewer',
    ];
    return staffRoles.includes(state.profile.role as UserRole);
  }, [state.profile]);

  return {
    ...state,
    login,
    logout,
    register,
    hasRole,
    isStaff,
    refreshProfile,
  };
}

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isLoading };
}

export function useRequireRole(roles: UserRole[], redirectTo: string = '/dashboard') {
  const { hasRole, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRole(roles)) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasRole, roles, redirectTo, router]);

  return { isLoading };
}
