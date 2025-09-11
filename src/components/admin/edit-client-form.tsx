
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateClient } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Client } from '@/lib/definitions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : 'Guardar Cambios'}
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

export function EditClientForm({ client, setOpen }: { client: Client, setOpen: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updateClient, { message: '' });
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setOpen(false);
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, setOpen]);

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="font-headline">Editar Cliente</DialogTitle>
                <DialogDescription>
                    Modifica los detalles del cliente.
                </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                <input type="hidden" name="id" value={client.id} />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" defaultValue={client.name} />
                        <FieldError errors={state.errors?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Apellido</Label>
                        <Input id="last_name" name="last_name" defaultValue={client.last_name} />
                        <FieldError errors={state.errors?.last_name} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email (Opcional)</Label>
                    <Input id="email" name="email" type="email" defaultValue={client.email || ''} />
                    <FieldError errors={state.errors?.email} />
                </div>

                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
