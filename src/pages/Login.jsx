import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Only allow same-site redirects after login.
function safeRedirect(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/AdminDashboard';
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirect = safeRedirect(searchParams.get('redirect'));
  const { session, isLoading } = useAuth();
  const [mode, setMode] = useState('password'); // password | link
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | working | sent
  const [error, setError] = useState('');

  if (!isLoading && session) {
    return <Navigate to={redirect} replace />;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('working');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (signInError) {
      console.error('Sign-in error:', signInError);
      setError(
        signInError.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : 'That email and password don’t match an admin account.'
      );
      setStatus('idle');
      return;
    }
    navigate(redirect, { replace: true });
  };

  const handleSendLink = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('working');

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        // Admin accounts are created in the Supabase dashboard; never sign up here.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    });

    if (signInError) {
      console.error('Sign-in error:', signInError);
      setError(
        signInError.status === 429
          ? 'Too many sign-in emails were requested recently. Please wait a while and try again, or use the most recent link already in your inbox.'
          : 'Could not send a sign-in link. Check the address, or ask an admin to add your account.'
      );
      setStatus('idle');
      return;
    }

    setStatus('sent');
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setStatus('idle');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin sign in</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'sent' ? (
            <div className="text-center py-4">
              <Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-700">
                Check <strong>{email}</strong> for a sign-in link.
              </p>
              <button type="button" onClick={() => switchMode('password')} className="mt-4 text-sm font-medium text-blue-700 hover:underline">
                Use a password instead
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'password' ? handlePasswordSignIn : handleSendLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {mode === 'password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={status === 'working'}>
                {status === 'working' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'password' ? 'Sign in' : 'Email me a sign-in link'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                {mode === 'password' ? (
                  <button type="button" onClick={() => switchMode('link')} className="font-medium text-blue-700 hover:underline">
                    Email me a sign-in link instead
                  </button>
                ) : (
                  <button type="button" onClick={() => switchMode('password')} className="font-medium text-blue-700 hover:underline">
                    Sign in with a password instead
                  </button>
                )}
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
