
'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Pencil } from 'lucide-react';
import { updateProductsCategory } from '@/lib/actions';
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

export function BatchEditCategoryForm({ productIds, allCategories, onActionCompleted }: { productIds: string[], allCategories: string[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateProductsCategory, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    
    const handleCategoryChange = (value: string) => {
        if (value === 'add_new') {
            setIsAddingNew(true);
            setSelectedCategory('');
        } else {
            setIsAddingNew(false);
            setSelectedCategory(value);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Cambiar Categoría...
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mover Productos de Categoría</DialogTitle>
                    <DialogDescription>
                        Mueve los {productIds.length} productos seleccionados a una nueva categoría.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <input type="hidden" name="productIds" value={productIds.join(',')} />
                    <div className="space-y-2">
                        <Label htmlFor="category-select">Categoría de Destino</Label>
                        <Select onValueChange={handleCategoryChange} value={isAddingNew ? 'add_new' : selectedCategory}>
                            <SelectTrigger id="category-select">
                                <SelectValue placeholder="Selecciona o crea una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="add_new">Crear nueva categoría</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="category" value={selectedCategory} />
                            {isAddingNew && (
                            <div className="space-y-2 pt-2">
                                    <Label htmlFor="new-category">Nueva Categoría</Label>
                                <Input 
                                    id="new-category" 
                                    name="new_category" 
                                    placeholder="Ej: Herramientas"
                                />
                            </div>
                        )}
                        <FieldError errors={state.errors?.category} />
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
