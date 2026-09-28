import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, Eye, EyeOff, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/auth';
import { Label } from '@/components/ui/label';
import AuthShell from '@/components/admin/AuthShell';

const inputClass =
  'h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] text-gray-900 shadow-sm transition ' +
  'placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 disabled:bg-gray-50';
const primaryButton =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white ' +
  'shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
const linkButton = 'rounded font-medium text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

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
  const [showPassword, setShowPassword] = useState(false);

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

  const isWorking = status === 'working';

  return (
    <AuthShell>
      {status === 'sent' ? (
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
            <Mail className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </span>
          <h1 className="mt-8 font-display text-2xl font-bold tracking-tight text-gray-900">Check your email</h1>
          <p className="mt-3 text-gray-600">
            We sent a sign-in link to <span className="font-medium text-gray-900">{normalizedEmail}</span>.
            It expires in one hour.
          </p>
          <p className="mt-6 rounded-xl bg-gray-50 px-4 py-3 text-left text-sm text-gray-500">
            Not there? Check spam, or wait a minute. Only admin accounts receive a link.
          </p>
          <button type="button" onClick={() => switchMode('password')} className={`mt-8 text-sm ${linkButton}`}>
            Sign in with a password instead
          </button>
        </div>
      ) : (
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            {mode === 'password' ? <KeyRound className="h-5 w-5" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Admin sign in</h1>
          <p className="mt-2 text-gray-500">
            {mode === 'password'
              ? 'Welcome back. Sign in to manage the Team UP4S site.'
              : 'We’ll email you a one-time link. No password needed.'}
          </p>

          <form onSubmit={mode === 'password' ? handlePasswordSignIn : handleSendLink} className="mt-8 space-y-5" noValidate={false}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isWorking}
                aria-invalid={!!error}
                className={inputClass}
              />
            </div>

            {mode === 'password' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" onClick={() => switchMode('link')} className={`text-sm ${linkButton}`}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isWorking}
                    aria-invalid={!!error}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button type="submit" disabled={isWorking} className={primaryButton}>
              {isWorking ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {mode === 'password' ? 'Signing in…' : 'Sending link…'}</>
              ) : mode === 'password' ? (
                <>Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" /></>
              ) : (
                'Email me a sign-in link'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
            <span className="h-px flex-1 bg-gray-200" /> or <span className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={() => switchMode(mode === 'password' ? 'link' : 'password')}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {mode === 'password'
              ? <><Mail className="h-4 w-4" aria-hidden="true" /> Email me a sign-in link instead</>
              : <><KeyRound className="h-4 w-4" aria-hidden="true" /> Sign in with a password instead</>}
          </button>
        </>
      )}
    </AuthShell>
  );
}
