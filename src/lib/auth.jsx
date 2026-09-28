import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/Login?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Not authorized</h1>
          <p className="text-gray-600 mb-6">
            {session.user.email} is signed in but doesn&apos;t have admin access.
          </p>
          <button
            onClick={signOut}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
