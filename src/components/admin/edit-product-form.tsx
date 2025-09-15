
'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/definitions';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { formatInputValue } from '@/lib/utils';

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

export function EditProductForm({ product, categories, setDialogOpen }: { product: Product, categories: string[], setDialogOpen: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updateProduct, { message: '' });
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<string>(product.category);
    const [isAddingNew, setIsAddingNew] = useState(false);

    // State for pricing logic
    const [precioCosto, setPrecioCosto] = useState(formatInputValue(String(product.precio_costo).replace('.', ',')));
    const [precioVenta, setPrecioVenta] = useState(formatInputValue(String(product.precio_venta).replace('.', ',')));
    const [porcentaje, setPorcentaje] = useState(0);
    const [pricingMethod, setPricingMethod] = useState('manual');


    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setDialogOpen(false);
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, setDialogOpen]);
    

    const handleCategoryChange = (value: string) => {
        if (value === 'add_new') {
            setIsAddingNew(true);
            setSelectedCategory('');
        } else {
            setIsAddingNew(false);
            setSelectedCategory(value);
        }
    };
    
    useEffect(() => {
        if (pricingMethod === 'porcentaje') {
            const cost = parseFloat(precioCosto.replace(/\./g, '').replace(',', '.')) || 0;
            const percentage = Number(porcentaje) || 0;
             if (cost > 0 && percentage > 0) {
              const calculatedSalePrice = cost * (1 + percentage / 100);
              setPrecioVenta(formatInputValue(calculatedSalePrice.toFixed(2).replace('.', ',')));
            } else {
                setPrecioVenta(formatInputValue(String(product.precio_venta).replace('.', ',')));
            }
        }
    }, [precioCosto, porcentaje, pricingMethod, product.precio_venta]);

    const handlePrecioCostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrecioCosto(formatInputValue(e.target.value));
    };

    const handlePrecioVentaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (pricingMethod === 'manual') {
            setPrecioVenta(formatInputValue(e.target.value));
        }
    };


    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="font-headline">Editar Producto</DialogTitle>
                <DialogDescription>
                    Modifica los detalles del producto.
                </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="precio_costo" value={precioCosto.replace(/\./g, '').replace(',', '.')} />
                <input type="hidden" name="precio_venta" value={precioVenta.replace(/\./g, '').replace(',', '.')} />


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Producto</Label>
                        <Input id="name" name="name" defaultValue={product.name} />
                        <FieldError errors={state.errors?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU (Opcional)</Label>
                        <Input id="sku" name="sku" defaultValue={product.sku || ''} />
                        <FieldError errors={state.errors?.sku} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Textarea id="description" name="description" defaultValue={product.description || ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="subcategory">Subcategoría (Opcional)</Label>
                        <Input id="subcategory" name="subcategory" defaultValue={product.subcategory || ''} />
                        <FieldError errors={state.errors?.subcategory} />
                    </div>
                </div>
                
                <div className="space-y-4 rounded-md border p-4">
                    <div className="space-y-2">
                        <Label htmlFor="precio_costo_display">Precio de Costo</Label>
                        <Input 
                            id="precio_costo_display" 
                            type="text" 
                            inputMode="decimal"
                            value={precioCosto} 
                            onChange={handlePrecioCostoChange}
                        />
                        <FieldError errors={state.errors?.precio_costo} />
                    </div>

                    <div className="space-y-3">
                        <Label>Definir Precio de Venta</Label>
                        <RadioGroup value={pricingMethod} onValueChange={setPricingMethod}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="manual" id="edit-manual" />
                                <Label htmlFor="edit-manual">Manual</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="porcentaje" id="edit-porcentaje" />
                                <Label htmlFor="edit-porcentaje">Por Porcentaje de Ganancia</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    
                    {pricingMethod === 'porcentaje' && (
                        <div className="space-y-2">
                            <Label htmlFor="porcentaje_ganancia">Porcentaje de Ganancia (%)</Label>
                            <Input 
                                id="porcentaje_ganancia"
                                type="number"
                                placeholder="Ej: 50"
                                onChange={(e) => setPorcentaje(Number(e.target.value))}
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="precio_venta_display">Precio de Venta</Label>
                        <Input 
                            id="precio_venta_display" 
                            type="text" 
                            inputMode="decimal"
                            value={precioVenta} 
                            onChange={handlePrecioVentaChange}
                            readOnly={pricingMethod === 'porcentaje'}
                        />
                        <FieldError errors={state.errors?.precio_venta} />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" defaultValue={product.stock}/>
                     <FieldError errors={state.errors?.stock} />
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
    );
}
