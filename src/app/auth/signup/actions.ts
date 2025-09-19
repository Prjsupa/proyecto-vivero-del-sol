
'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function signup(prevState: { message: string, success?: boolean } | undefined, formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const validatedFields = signupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0];
    return {
      message: firstError.message,
    };
  }
  
  const { name, last_name, email, password } = validatedFields.data;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        last_name,
      }
    }
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
