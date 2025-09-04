'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handleRecommendation } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sprout, AlertCircle, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full font-headline" disabled={pending}>
      {pending ? 'Thinking...' : 'Get Recommendations'}
      <Sprout className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function PlantRecommender() {
  const [state, formAction] = useFormState(handleRecommendation, { message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === 'success') {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <form action={formAction} ref={formRef}>
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl flex items-center justify-center gap-2">
            <Sparkles className="text-accent" />
            AI Plant Helper
            <Sparkles className="text-accent" />
          </CardTitle>
          <CardDescription className="font-body text-base">
            Tell us what you're looking for, and we'll suggest the perfect plants for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="preferences" className="font-headline text-lg">Desired Vibe</Label>
            <Textarea
              id="preferences"
              name="preferences"
              placeholder="e.g., 'low-maintenance', 'colorful flowers', 'air-purifying', 'tropical feel'"
              rows={3}
              required
            />
            {state?.errors?.preferences && (
              <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} />{state.errors.preferences}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="environment" className="font-headline text-lg">Environment</Label>
              <Select name="environment" defaultValue="indoor-bright">
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Select your environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor-bright">Indoor - Bright Light</SelectItem>
                  <SelectItem value="indoor-low">Indoor - Low Light</SelectItem>
                  <SelectItem value="outdoor-sun">Outdoor - Full Sun</SelectItem>
                  <SelectItem value="outdoor-shade">Outdoor - Shade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-headline text-lg">Your Experience</Label>
              <RadioGroup name="experience" defaultValue="beginner" className="flex space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <Label htmlFor="expert">Expert</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          {state?.message && state.message !== 'success' && (
             <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle size={14} />{state.message}</p>
          )}
        </CardFooter>
      </form>

      {state?.message === 'success' && state.data && (
        <Card className="m-6 mt-0 bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline text-primary">Here are your recommendations!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-body text-foreground">{state.data}</p>
            </CardContent>
        </Card>
      )}
    </Card>
  );
}
