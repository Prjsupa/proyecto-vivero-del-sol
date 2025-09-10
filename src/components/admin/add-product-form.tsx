
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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
    
    // State for pricing logic
    const [precioCosto, setPrecioCosto] = useState(0);
    const [precioVenta, setPrecioVenta] = useState(0);
    const [porcentaje, setPorcentaje] = useState(0);
    const [pricingMethod, setPricingMethod] = useState('manual');


    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
            resetFormState();
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    const resetFormState = () => {
        formRef.current?.reset();
        setSelectedCategory('');
        setIsAddingNew(false);
        setPrecioCosto(0);
        setPrecioVenta(0);
        setPorcentaje(0);
        setPricingMethod('manual');
    };

    const onDialogChange = (open: boolean) => {
        if (!open) {
            resetFormState();
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

    useEffect(() => {
        if (pricingMethod === 'porcentaje') {
            const cost = Number(precioCosto) || 0;
            const percentage = Number(porcentaje) || 0;
            const calculatedSalePrice = cost * (1 + percentage / 100);
            setPrecioVenta(Number(calculatedSalePrice.toFixed(2)));
        }
    }, [precioCosto, porcentaje, pricingMethod]);


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
                <form action={formAction} ref={formRef} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Producto</Label>
                            <Input id="name" name="name" />
                            <FieldError errors={state.errors?.name} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="sku">SKU (Opcional)</Label>
                            <Input id="sku" name="sku" placeholder="CÓDIGO-001"/>
                            <FieldError errors={state.errors?.sku} />
                        </div>
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
                            <Label htmlFor="subcategory">Subcategoría (Opcional)</Label>
                            <Input id="subcategory" name="subcategory" placeholder="Ej: Hojas grandes"/>
                            <FieldError errors={state.errors?.subcategory} />
                        </div>
                    </div>
                    
                    <div className="space-y-4 rounded-md border p-4">
                        <div className="space-y-2">
                            <Label htmlFor="precio_costo">Precio de Costo</Label>
                            <Input id="precio_costo" name="precio_costo" type="text" placeholder="1000,00" onChange={(e) => setPrecioCosto(Number(e.target.value.replace(',', '.')))} />
                            <FieldError errors={state.errors?.precio_costo} />
                        </div>

                        <div className="space-y-3">
                            <Label>Definir Precio de Venta</Label>
                            <RadioGroup value={pricingMethod} onValueChange={setPricingMethod}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="manual" id="manual" />
                                    <Label htmlFor="manual">Manual</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="porcentaje" id="porcentaje" />
                                    <Label htmlFor="porcentaje">Por Porcentaje de Ganancia</Label>
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
                            <Label htmlFor="precio_venta">Precio de Venta</Label>
                            <Input 
                                id="precio_venta" 
                                name="precio_venta" 
                                type="text" 
                                placeholder="1500,00" 
                                value={precioVenta} 
                                onChange={(e) => setPrecioVenta(Number(e.target.value.replace(',', '.')))} 
                                readOnly={pricingMethod === 'porcentaje'}
                            />
                            <FieldError errors={state.errors?.precio_venta} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" name="stock" type="number" defaultValue="0" />
                         <FieldError errors={state.errors?.stock} />
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" name="description" placeholder="Describe el producto..."/>
                    </div>
                    
                     <div className="flex items-center space-x-2 pt-4">
                        <Switch id="available" name="available" defaultChecked />
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
