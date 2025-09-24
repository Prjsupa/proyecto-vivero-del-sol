'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Pencil } from 'lucide-react';
import { updateServicesDescription } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Moviendo...</> : 'Mover Servicios'}
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

export function BatchEditServiceDescriptionForm({ serviceIds, onActionCompleted }: { serviceIds: string[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateServicesDescription, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
            onActionCompleted();
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, onActionCompleted]);
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Cambiar Descripción...
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mover Servicios de Descripción</DialogTitle>
                    <DialogDescription>
                        Asigna una nueva descripción a los {serviceIds.length} servicios seleccionados.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <input type="hidden" name="serviceIds" value={serviceIds.join(',')} />
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción de Destino</Label>
                        <Textarea id="description" name="description" placeholder="Ej: Incluye visita, diagnóstico y..." />
                        <p className="text-xs text-muted-foreground pt-2">Para eliminar la descripción de los servicios seleccionados, deja el campo en blanco.</p>
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
