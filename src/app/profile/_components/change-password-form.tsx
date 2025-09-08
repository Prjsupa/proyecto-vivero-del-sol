'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePassword } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : 'Update Password'}
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

export function ChangePasswordForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updatePassword, { message: '' });
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: 'Success!',
                description: state.data,
            });
            formRef.current?.reset();
            setDialogOpen(false);
        } else if (state?.message && state.message !== 'success' && !state.errors) {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, setDialogOpen]);


    return (
        <form action={formAction} ref={formRef}>
            <Card className="shadow-none border-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound size={24} /> Change Password</CardTitle>
                    <CardDescription>Enter your current and new password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" />
                        <FieldError errors={state.errors?.currentPassword} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" name="password" type="password" />
                        <FieldError errors={state.errors?.password} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" />
                         <FieldError errors={state.errors?.confirmPassword} />
                    </div>
                </CardContent>
                <CardFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    )
}
