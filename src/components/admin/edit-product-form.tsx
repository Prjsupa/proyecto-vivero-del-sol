
'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/definitions';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

export function EditProductForm({ product, categories }: { product: Product, categories: string[] }) {
    const [state, formAction] = useActionState(updateProduct, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string>(product.category);
    const [isAddingNew, setIsAddingNew] = useState(false);


    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    
    const onDialogChange = (open: boolean) => {
        if (!open) {
            formRef.current?.reset();
            setSelectedCategory(product.category);
            setIsAddingNew(false);
        }
        setIsDialogOpen(open);
    }

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
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                <button className="w-full text-left">Editar</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">Editar Producto</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del producto.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                    <input type="hidden" name="id" value={product.id} />

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Producto</Label>
                        <Input id="name" name="name" defaultValue={product.name} />
                        <FieldError errors={state.errors?.name} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descripción (Opcional)</Label>
                        <Textarea id="description" name="description" defaultValue={product.description || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category-select">Categoría</Label>
                          <Select onValueChange={handleCategoryChange} value={isAddingNew ? 'add_new' : selectedCategory}>
                            <SelectTrigger id="category-select">
                                <SelectValue placeholder="Selecciona o crea una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio</Label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} />
                            <FieldError errors={state.errors?.price} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" name="stock" type="number" defaultValue={product.stock}/>
                             <FieldError errors={state.errors?.stock} />
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="available" name="available" defaultChecked={product.available} />
                        <Label htmlFor="available">Disponible para la venta</Label>
                    </div>
                     <DialogFooter className="mt-4">
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
