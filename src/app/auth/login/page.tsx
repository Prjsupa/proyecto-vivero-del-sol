'use client';

import { login } from './actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
      <LogIn className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
        <CardDescription className="font-body">Sign in to continue to your garden.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {state?.message && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />

           <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
        </form>
      </CardContent>
    </Card>
  );
}
