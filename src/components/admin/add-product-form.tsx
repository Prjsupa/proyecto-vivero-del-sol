'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, PlusCircle, Loader2 } from 'lucide-react';
import { addProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear Producto'}
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


export function AddProductForm({ categories }: { categories: string[] }) {
    const [state, formAction] = useActionState(addProduct, { message: '' });
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
            formRef.current?.reset();
            setSelectedCategory('');
            setIsAddingNew(false);
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
            setSelectedCategory('');
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
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Rellena los detalles del nuevo producto.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Producto</Label>
                        <Input id="name" name="name" />
                        <FieldError errors={state.errors?.name} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" name="stock" type="number" defaultValue="0" />
                             <FieldError errors={state.errors?.stock} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input id="price" name="price" type="number" step="0.01" placeholder="$0.00" />
                        <FieldError errors={state.errors?.price} />
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" placeholder="Describe el producto..."/>
                    </div>
                    
                     <div className="flex items-center space-x-2 pt-4">
                        <Switch id="available" name="available" defaultChecked />
                        <Label htmlFor="available">Disponible para la venta</Label>
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
