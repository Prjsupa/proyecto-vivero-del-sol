
'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Edit } from 'lucide-react';
import { updateSubcategoryName } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</> : 'Actualizar Subcategoría'}
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

export function EditSubcategoryForm({ subcategoryName, onSubcategoryUpdated }: { subcategoryName: string, onSubcategoryUpdated: () => void }) {
    const [state, formAction] = useActionState(updateSubcategoryName, { message: '' });
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
            onSubcategoryUpdated();
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, onSubcategoryUpdated]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Nombre
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Nombre de Subcategoría</DialogTitle>
                    <DialogDescription>
                        Renombra la subcategoría '{subcategoryName}'. Esto actualizará todos los productos asociados.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <input type="hidden" name="oldSubcategoryName" value={subcategoryName} />
                    <div className="space-y-2">
                        <Label htmlFor="newSubcategoryName">Nuevo nombre de la subcategoría</Label>
                        <Input id="newSubcategoryName" name="newSubcategoryName" defaultValue={subcategoryName} />
                        <FieldError errors={state.errors?.newSubcategoryName} />
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
