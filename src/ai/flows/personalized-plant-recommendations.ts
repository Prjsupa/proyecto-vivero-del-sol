// src/ai/flows/personalized-plant-recommendations.ts
'use server';
/**
 * @fileOverview Provides personalized plant recommendations based on user preferences, environment, and gardening experience.
 *
 * - getPersonalizedPlantRecommendations - A function that takes user preferences, environment, and gardening experience as input and returns a list of plant recommendations.
 * - PersonalizedPlantRecommendationsInput - The input type for the getPersonalizedPlantRecommendations function.
 * - PersonalizedPlantRecommendationsOutput - The return type for the getPersonalizedPlantRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedPlantRecommendationsInputSchema = z.object({
  preferences: z
    .string()
    .describe('Keywords describing the desired look and feel of the plants.'),
  environment: z.string().describe('Description of the user environment.'),
  experience: z.string().describe('User gardening experience level.'),
});

export type PersonalizedPlantRecommendationsInput =
  z.infer<typeof PersonalizedPlantRecommendationsInputSchema>;

const PersonalizedPlantRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('A list of plant recommendations based on the input.'),
});

export type PersonalizedPlantRecommendationsOutput =
  z.infer<typeof PersonalizedPlantRecommendationsOutputSchema>;

export async function getPersonalizedPlantRecommendations(
  input: PersonalizedPlantRecommendationsInput
): Promise<PersonalizedPlantRecommendationsOutput> {
  return personalizedPlantRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedPlantRecommendationsPrompt',
  input: {schema: PersonalizedPlantRecommendationsInputSchema},
  output: {schema: PersonalizedPlantRecommendationsOutputSchema},
  prompt: `You are a plant recommendation expert. Based on the user's preferences, environment, and gardening experience, you will provide a list of plant recommendations.  Take into account only some of the details if some are contradictory.

User Preferences: {{{preferences}}}
Environment: {{{environment}}}
Gardening Experience: {{{experience}}}`,
});

const personalizedPlantRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedPlantRecommendationsFlow',
    inputSchema: PersonalizedPlantRecommendationsInputSchema,
    outputSchema: PersonalizedPlantRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
