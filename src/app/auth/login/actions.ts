'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(prevState: { message: string, success?: boolean } | undefined, formData: FormData) {
  const supabase = createClient();
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid email or password.',
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
     return {
      message: 'Could not authenticate user. Please check your credentials.',
      success: false,
    };
  }

  // Redirect is handled client-side now
  return {
    message: 'Login successful!',
    success: true,
  };
}
