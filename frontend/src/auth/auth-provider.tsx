import type { Profile } from 'src/lib/database.types';
import type { User, Session } from '@supabase/supabase-js';

import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { supabase } from 'src/lib/supabase';

import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------
// Auth context — the single source of truth for the signed-in user.
// Wraps Supabase Auth: tracks the session, the buyer profile, and whether
// the user is an admin (via the SECURITY DEFINER is_admin() RPC, since the
// `admins` table itself is not client-readable under RLS).
// ----------------------------------------------------------------------

type AuthContextValue = {
  loading: boolean; // initial session check not yet finished
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  metaUserId: string | null; // user id that `profile`/`isAdmin` correspond to
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    mobile?: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestSignOut: () => void; // opens a global "Sign out?" confirm dialog
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

async function fetchMeta(user: User | null): Promise<{ profile: Profile | null; isAdmin: boolean }> {
  if (!user) return { profile: null, isAdmin: false };
  const [profileRes, adminRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.rpc('is_admin'),
  ]);
  return {
    profile: (profileRes.data as Profile | null) ?? null,
    isAdmin: adminRes.data === true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metaUserId, setMetaUserId] = useState<string | null>(null);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const apply = async (nextSession: Session | null) => {
      if (active) setSession(nextSession);
      const user = nextSession?.user ?? null;

      if (!user) {
        if (!active) return;
        setProfile(null);
        setIsAdmin(false);
        setMetaUserId(null);
        setLoading(false);
        return;
      }

      const meta = await fetchMeta(user);
      if (!active) return;
      setProfile(meta.profile);
      setIsAdmin(meta.isAdmin);
      setMetaUserId(user.id);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => apply(nextSession));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      const message =
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message;
      return { error: message };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, mobile?: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) return { error: error.message, needsConfirmation: false };

      // If a session came back, email confirmation is off → store the mobile too.
      if (data.session && mobile?.trim()) {
        await supabase.from('profiles').update({ mobile: mobile.trim() }).eq('id', data.session.user.id);
      }
      // No session means Supabase requires email confirmation before sign-in.
      return { error: null, needsConfirmation: !data.session };
    },
    []
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login/reset`,
    });
    return { error: error ? error.message : null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const requestSignOut = useCallback(() => setConfirmSignOutOpen(true), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      isAdmin,
      metaUserId,
      signIn,
      signUp,
      sendPasswordReset,
      updatePassword,
      signOut,
      requestSignOut,
    }),
    [loading, session, profile, isAdmin, metaUserId, signIn, signUp, sendPasswordReset, updatePassword, signOut, requestSignOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={confirmSignOutOpen}
        title="Sign out?"
        content="You'll need to sign in again to access your account."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        confirmColor="error"
        onClose={() => setConfirmSignOutOpen(false)}
        onConfirm={() => {
          void signOut();
        }}
      />
    </AuthContext.Provider>
  );
}
