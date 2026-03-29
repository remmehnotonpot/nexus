"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasRedirected = useRef(false);

  // Get redirect URL from query params, default to /ops/dashboard
  const redirectTo = searchParams.get('redirectTo') || '/ops/dashboard';

  // Debug logging
  useEffect(() => {
    console.log('[LoginPage] Auth state:', { isAuthenticated, isAuthLoading, hasRedirected: hasRedirected.current });
  }, [isAuthenticated, isAuthLoading]);

  // Handle redirect when auth state changes
  useEffect(() => {
    console.log('[LoginPage] Checking redirect:', { isAuthenticated, isAuthLoading, hasRedirected: hasRedirected.current, redirectTo });
    if (isAuthenticated && !isAuthLoading && !hasRedirected.current) {
      console.log('[LoginPage] Redirecting to:', redirectTo);
      hasRedirected.current = true;
      // Use window.location.replace to prevent back button loop
      window.location.replace(redirectTo);
    }
  }, [isAuthenticated, isAuthLoading, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('[LoginPage] Submitting login form:', { email });

    const { error: loginError } = await login(email, password);

    if (loginError) {
      console.error('[LoginPage] Login error:', loginError);
      setError(loginError.message || 'Invalid email or password');
      setIsLoading(false);
      return;
    }

    console.log('[LoginPage] Login returned success, waiting for auth state...');
    // Auth state change will trigger the useEffect above to handle redirect
    // If profile is missing, auth will fail and we'll stay on the login page
    setTimeout(() => {
      // Reset loading state after a delay if we're still on the page
      // (this happens if profile fetch fails)
      console.log('[LoginPage] Timeout - resetting loading state');
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Swish Portal account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
