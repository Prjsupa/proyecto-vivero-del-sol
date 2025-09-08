
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

export function BatchEditSubcategoryForm({ productIds, allSubcategories, onActionCompleted }: { productIds: string[], allSubcategories: string[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateProductsSubcategory, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
    const [isAddingNew, setIsAddingNew] = useState(false);

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
    
    const handleSubcategoryChange = (value: string) => {
        if (value === 'add_new') {
            setIsAddingNew(true);
            setSelectedSubcategory('');
        } else {
            setIsAddingNew(false);
            setSelectedSubcategory(value);
        }
    };
    
    const onDialogChange = (open: boolean) => {
        if (!open) {
            formRef.current?.reset();
            setSelectedSubcategory('');
            setIsAddingNew(false);
        }
        setIsDialogOpen(open);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
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
                        <Label htmlFor="subcategory-select">Subcategoría de Destino</Label>
                         <Select onValueChange={handleSubcategoryChange} value={isAddingNew ? 'add_new' : selectedSubcategory}>
                            <SelectTrigger id="subcategory-select">
                                <SelectValue placeholder="Selecciona o crea una subcategoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {allSubcategories.map(sub => (
                                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                ))}
                                <SelectItem value="add_new">Crear nueva subcategoría</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="subcategory" value={selectedSubcategory} />
                        {isAddingNew && (
                             <div className="space-y-2 pt-2">
                                <Label htmlFor="new-subcategory">Nueva Subcategoría</Label>
                                <Input 
                                    id="new-subcategory" 
                                    name="new_subcategory" 
                                    placeholder="Ej: Trepadoras"
                                />
                             </div>
                        )}
                        <p className="text-xs text-muted-foreground pt-2">Para eliminar la subcategoría de los productos seleccionados, crea una "nueva subcategoría" y deja el campo en blanco.</p>
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
