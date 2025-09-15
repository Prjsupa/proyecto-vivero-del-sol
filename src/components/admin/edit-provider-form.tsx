
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateProvider } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Provider, ProviderType } from '@/lib/definitions';

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

export function EditProviderForm({ provider, providerTypes, setDialogOpen }: { provider: Provider, providerTypes: ProviderType[], setDialogOpen: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updateProvider, { message: '' });
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setDialogOpen(false);
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, setDialogOpen]);

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Editar Proveedor</DialogTitle>
                <DialogDescription>
                    Modifica los datos del proveedor.
                </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                <input type="hidden" name="id" value={provider.id} />
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Proveedor</Label>
                    <Input id="name" name="name" defaultValue={provider.name} />
                    <FieldError errors={state.errors?.name} />
                    {state.message && state.message !== 'success' && !state.errors && (
                        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle size={14} /> {state.message}
                        </p>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="provider_type_code">Tipo de Proveedor (Opcional)</Label>
                    <Input id="provider_type_code" name="provider_type_code" defaultValue={provider.provider_type_code || ''} placeholder="Ej: NAC (Nacional)"/>
                    <FieldError errors={state.errors?.provider_type_code} />
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
