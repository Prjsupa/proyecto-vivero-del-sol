'use client';
import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import type { Profile } from "@/lib/definitions";
import { updateProfile } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Profile'}
        </Button>
    )
}

function FieldError({ errors }: { errors?: string[] }) {
    if (!errors) return null;
    return (
        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
            <AlertCircle size={14} />
            {errors[0]}
        </p>
    )
}


export function ProfileForm({ profile }: { profile: Profile }) {
    const [state, formAction] = useActionState(updateProfile, { message: '' });
    const { toast } = useToast();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: 'Success!',
                description: state.data,
            });
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const getInitials = (name: string, lastName: string) => {
        return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
    }

    return (
        <form action={formAction}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your personal information and avatar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                         <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarPreview || undefined} alt="User avatar" />
                            <AvatarFallback className="text-3xl font-headline bg-secondary text-secondary-foreground">
                                {avatarPreview ? null : getInitials(profile.name, profile.last_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                             <Label htmlFor="avatar">Profile Picture</Label>
                            <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} ref={fileInputRef}/>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 4MB.</p>
                             <FieldError errors={state.errors?.avatar} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={profile.name} />
                             <FieldError errors={state.errors?.name} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" name="last_name" defaultValue={profile.last_name} />
                             <FieldError errors={state.errors?.last_name} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    )
}
