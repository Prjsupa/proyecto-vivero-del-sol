
'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Loader2, Pencil } from 'lucide-react';
import { updateProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import type { Product } from '@/lib/definitions';

const productCategories = ['Planta de interior', 'Planta de exterior', 'Planta frutal', 'Planta ornamental', 'Suculenta', 'Herramienta', 'Fertilizante', 'Maceta'] as const;

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


export function EditProductForm({ product }: { product: Product }) {
    const [state, formAction] = useActionState(updateProduct, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(product.img_url);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(product.img_url);
        }
    };
    
    const onDialogChange = (open: boolean) => {
        if (!open) {
            formRef.current?.reset();
            setImagePreview(product.img_url);
        }
        setIsDialogOpen(open);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                <button className="w-full text-left">Editar</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Editar Producto</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del producto.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="current_img_url" value={product.img_url} />

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Producto</Label>
                        <Input id="name" name="name" defaultValue={product.name} />
                        <FieldError errors={state.errors?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select name="category" defaultValue={product.category}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {productCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    <div className="space-y-2">
                        <Label htmlFor="size">Tamaño (opcional)</Label>
                        <Input id="size" name="size" placeholder="Ej: Pequeño, Mediano, 5L" defaultValue={product.size || ''} />
                        <FieldError errors={state.errors?.size} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="image">Imagen del Producto</Label>
                        <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
                        <p className="text-xs text-muted-foreground">Deja en blanco para conservar la imagen actual.</p>
                        <FieldError errors={state.errors?.image} />
                    </div>
                    {imagePreview && (
                        <div className="space-y-2">
                            <Label>Vista Previa</Label>
                            <div className="relative h-48 w-full rounded-md border overflow-hidden">
                                <Image src={imagePreview} alt="Image preview" fill className="object-contain" />
                            </div>
                        </div>
                    )}
                     <div className="flex items-center space-x-2">
                        <Switch id="available" name="available" defaultChecked={product.available} />
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
