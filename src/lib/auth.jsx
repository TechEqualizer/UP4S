import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import AuthShell from '@/components/admin/AuthShell';

const AuthContext = createContext({ session: null, isAdmin: false, isLoading: true });

async function checkIsAdmin(session) {
  if (!session) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
  return Boolean(data);
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ session: null, isAdmin: false, isLoading: true });

  useEffect(() => {
    let active = true;

    const apply = async (session) => {
      const isAdmin = await checkIsAdmin(session);
      if (active) setState({ session, isAdmin, isLoading: false });
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    // Don't await Supabase calls inside the callback (it can deadlock the client).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => apply(session), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function signOut() {
  return supabase.auth.signOut();
}

export function RequireAdmin({ children }) {
  const { session, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/Login?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) {
    return (
      <AuthShell>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <Lock className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">No admin access</h1>
        <p className="mt-3 text-gray-600">
          <span className="font-medium text-gray-900">{session.user.email}</span> is signed in but isn&apos;t on the
          admin list. Ask an existing admin to add you, or sign in with a different account.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Sign out and switch account
        </button>
      </AuthShell>
    );
  }

  return children;
}
