'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { handleContact } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full font-headline" disabled={pending}>
      {pending ? 'Sending...' : 'Send Message'}
      <Send className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(handleContact, { message: '' });
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message === 'success') {
      formRef.current?.reset();
      toast({
        title: 'Message Sent!',
        description: state.data,
      });
    }
  }, [state, toast]);

  return (
    <Card className="h-full">
      <form action={formAction} ref={formRef}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-headline text-lg">Name</Label>
            <Input id="name" name="name" placeholder="Your name" required />
            {state?.errors?.name && (
              <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} />{state.errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-headline text-lg">Email</Label>
            <Input id="email" name="email" type="email" placeholder="Your email" required />
            {state?.errors?.email && (
              <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} />{state.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="font-headline text-lg">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="How can we help you?"
              rows={5}
              required
            />
            {state?.errors?.message && (
              <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} />{state.errors.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          {state?.message && state.message !== 'success' && (
             <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} />{state.message}</p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
