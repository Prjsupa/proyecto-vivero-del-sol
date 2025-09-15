'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Edit } from 'lucide-react';
import { updateServiceDescriptionText } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : 'Actualizar Descripción'}
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

export function EditServiceDescriptionForm({ description, onDescriptionUpdated }: { description: string, onDescriptionUpdated: () => void }) {
    const [state, formAction] = useActionState(updateServiceDescriptionText, { message: '' });
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
            onDescriptionUpdated();
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, onDescriptionUpdated]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Texto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Texto de la Descripción</DialogTitle>
                    <DialogDescription>
                        Modifica el texto de la descripción. Esto se actualizará en todos los servicios que la utilicen.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <input type="hidden" name="oldDescription" value={description} />
                    <div className="space-y-2">
                        <Label htmlFor="newDescription">Nuevo texto de la descripción</Label>
                        <Textarea id="newDescription" name="newDescription" defaultValue={description} rows={5} />
                        <FieldError errors={state.errors?.newDescription} />
                         {state.message && state.message !== 'success' && !state.errors && (
                            <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle size={14} />
                                {state.message}
                            </p>
                        )}
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
