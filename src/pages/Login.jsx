import React, { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
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
  const redirect = safeRedirect(searchParams.get('redirect'));
  const { session, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');

  if (!isLoading && session) {
    return <Navigate to={redirect} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('sending');

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // Admin accounts are created in the Supabase dashboard; never sign up here.
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    });

    if (signInError) {
      console.error('Sign-in error:', signInError);
      setError('Could not send a sign-in link. Check the address, or ask an admin to add your account.');
      setStatus('idle');
      return;
    }

    setStatus('sent');
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={status === 'sending'}>
                {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Email me a sign-in link'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
