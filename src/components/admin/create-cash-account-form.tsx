'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2 } from 'lucide-react';
import { addCashAccount } from '@/lib/aux-actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear Cuenta'}
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

export function CreateCashAccountForm({ onActionCompleted }: { onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(addCashAccount, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const handledRef = useRef(false);

    useEffect(() => {
        if (!state) return;
        if (state.message === 'success' && !handledRef.current) {
            handledRef.current = true;
            toast({ title: '¡Éxito!', description: state.data });
            setIsDialogOpen(false);
            formRef.current?.reset();
            onActionCompleted();
        } else if (state.message && state.message !== 'success' && !state.errors && !handledRef.current) {
            handledRef.current = true;
            toast({ title: 'Error', description: state.message, variant: 'destructive' });
        }
    }, [state, toast, onActionCompleted]);

    // Reset the handled flag when dialog opens to allow new submission to toast once
    useEffect(() => {
        if (isDialogOpen) {
            handledRef.current = false;
        }
    }, [isDialogOpen]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Cuenta de Caja
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Cuenta de Caja</DialogTitle>
                    <DialogDescription>
                       Define el código, descripción y tipo de cuenta.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input id="code" name="code" placeholder="Ej: EFE" />
                        <FieldError errors={state.errors?.code} />
                         {state.message && state.message !== 'success' && !state.errors && (
                             <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {state.message}
                            </p>
                         )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" placeholder="Ej: Efectivo" />
                        <FieldError errors={state.errors?.description} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="account_type">Tipo de Cuenta</Label>
                        <Input id="account_type" name="account_type" placeholder="Ej: Dinero" />
                        <FieldError errors={state.errors?.account_type} />
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
