'use server';

import { z } from 'zod';
import { getPersonalizedPlantRecommendations } from '@/ai/flows/personalized-plant-recommendations';

const recommendationSchema = z.object({
  preferences: z.string().min(3, 'Please describe your preferences.'),
  environment: z.string(),
  experience: z.string(),
});

export async function handleRecommendation(prevState: any, formData: FormData) {
  const validatedFields = recommendationSchema.safeParse({
    preferences: formData.get('preferences'),
    environment: formData.get('environment'),
    experience: formData.get('experience'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const result = await getPersonalizedPlantRecommendations(validatedFields.data);
    return {
      message: 'success',
      data: result.recommendations,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to get recommendations. Please try again.',
    };
  }
}

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export async function handleContact(prevState: any, formData: FormData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Simulate sending the data
  console.log('Contact Form Submitted:', validatedFields.data);

  return {
    message: 'success',
    data: 'Thank you for your message! We will get back to you soon.',
  };
}
