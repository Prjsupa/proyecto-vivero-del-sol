'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function signup(prevState: { message: string, success?: boolean } | undefined, formData: FormData) {
  const supabase = createClient();
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0];
    return {
      message: firstError.message,
    };
  }
  
  const { email, password } = validatedFields.data;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      message: 'Could not create user. Please try again.',
    };
  }

  if (data.user && data.user.identities?.length === 0) {
    return {
      message: 'User already exists. Please sign in.',
      success: false
    };
  }
  
  return {
    message: 'Check your email to confirm your account.',
    success: true
  };
}
