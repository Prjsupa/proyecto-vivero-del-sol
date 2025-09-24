'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2 } from 'lucide-react';
import { addCurrency } from '@/lib/aux-actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear Moneda'}
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

export function CreateCurrencyForm({ onActionCompleted }: { onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(addCurrency, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({ title: '¡Éxito!', description: state.data });
            setIsDialogOpen(false);
            formRef.current?.reset();
            onActionCompleted();
        } else if (state?.message && state.message !== 'success' && !state.errors) {
             toast({ title: 'Error', description: state.message, variant: 'destructive' });
        }
    }, [state, toast, onActionCompleted]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Moneda
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Moneda</DialogTitle>
                    <DialogDescription>
                       Define el código y la descripción para la nueva moneda.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input id="code" name="code" placeholder="Ej: ARS" />
                        <FieldError errors={state.errors?.code} />
                         {state.message && state.message !== 'success' && !state.errors && (
                             <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {state.message}
                            </p>
                         )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" placeholder="Ej: Peso Argentino" />
                        <FieldError errors={state.errors?.description} />
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
