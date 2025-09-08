
'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Pencil } from 'lucide-react';
import { updateProductsSubcategory } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Moviendo...</> : 'Mover Productos'}
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

export function BatchEditSubcategoryForm({ productIds, onActionCompleted }: { productIds: string[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateProductsSubcategory, { message: '' });
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
                    Cambiar Subcategoría...
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mover Productos de Subcategoría</DialogTitle>
                    <DialogDescription>
                        Mueve los {productIds.length} productos seleccionados a una nueva subcategoría.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <input type="hidden" name="productIds" value={productIds.join(',')} />
                    <div className="space-y-2">
                        <Label htmlFor="subcategory">Nueva Subcategoría</Label>
                        <Input 
                            id="subcategory" 
                            name="subcategory" 
                            placeholder="Ej: Trepadoras"
                        />
                         <p className="text-xs text-muted-foreground">Dejar en blanco para eliminar la subcategoría de los productos seleccionados.</p>
                        <FieldError errors={state.errors?.subcategory} />
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

