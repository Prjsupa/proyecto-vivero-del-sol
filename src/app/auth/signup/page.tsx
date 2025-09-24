'use client';
import { signup } from './actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create Account'}
      <UserPlus className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, undefined);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
        <CardDescription className="font-body">Join our community of plant lovers.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" placeholder="Doe" required />
              </div>
           </div>
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
            <Alert variant={state.success ? 'default' : 'destructive'}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{state.success ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
