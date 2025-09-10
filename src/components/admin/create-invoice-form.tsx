
'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Receipt, Search, X } from 'lucide-react';
import { createInvoice } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { Profile, Product } from '@/lib/definitions';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { formatPrice } from '@/lib/utils';
import { Badge } from '../ui/badge';

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

type SelectedProduct = {
    product: Product;
    quantity: number;
    total: number;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear Factura'}
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

interface CreateInvoiceFormProps {
    customers: UserWithProfile[];
    products: Product[];
    selectedCustomerId?: string;
    triggerMode?: 'button' | 'menuitem';
}


export function CreateInvoiceForm({ customers, products, selectedCustomerId, triggerMode = 'button' }: CreateInvoiceFormProps) {
    const [state, formAction] = useActionState(createInvoice, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [showSecondaryPayment, setShowSecondaryPayment] = useState(false);

    // POS State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.available && p.stock > 0);
    }, [products, searchTerm]);

    const addProductToInvoice = (product: Product) => {
        setSelectedProducts(currentProducts => {
            const existingProduct = currentProducts.find(p => p.product.id === product.id);
            if (existingProduct) {
                return currentProducts.map(p => p.product.id === product.id ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.product.precio_venta } : p);
            }
            return [...currentProducts, { product, quantity: 1, total: product.precio_venta }];
        });
        setSearchTerm('');
    }

     const removeProductFromInvoice = (productId: string) => {
        setSelectedProducts(currentProducts => currentProducts.filter(p => p.product.id !== productId));
    };


    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
            formRef.current?.reset();
            setShowSecondaryPayment(false);
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
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
            setShowSecondaryPayment(false);
        }
        setIsDialogOpen(open);
    }
    
    const TriggerComponent = triggerMode === 'button' ? (
        <Button>
            <Receipt className="mr-2 h-4 w-4" />
            Crear Factura
        </Button>
    ) : (
        <span className='w-full'>Crear Factura</span>
    );

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                 {TriggerComponent}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Factura</DialogTitle>
                    <DialogDescription>
                        Completa los detalles para generar una nueva factura.
                    </DialogDescription>
                </DialogHeader>
                 <form action={formAction} ref={formRef} className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                        <input type="hidden" name="products" value={JSON.stringify(selectedProducts)} />

                        {/* Product Search and Add */}
                        <div className="space-y-4 rounded-md border p-4">
                             <Label>Añadir Productos</Label>
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar producto por nombre..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredProducts.map(p => (
                                            <div key={p.id} onClick={() => addProductToInvoice(p)} className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between">
                                                <span>{p.name}</span>
                                                <span className="text-muted-foreground">{formatPrice(p.precio_venta)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>

                         {/* Selected Products List */}
                        <div className="space-y-4 rounded-md border p-4 flex-grow">
                             <Label>Productos en la Factura</Label>
                             <ScrollArea className="h-64">
                                {selectedProducts.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10">
                                        Aún no se han añadido productos.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedProducts.map(item => (
                                            <div key={item.product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                <div>
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.quantity} x {formatPrice(item.product.precio_venta)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold">{formatPrice(item.total)}</p>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeProductFromInvoice(item.product.id)}>
                                                        <X className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </ScrollArea>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Cliente</Label>
                            <Select name="clientId" defaultValue={selectedCustomerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id}>{customer.name} {customer.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={state.errors?.clientId} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Factura</Label>
                            <RadioGroup name="invoiceType" defaultValue="B">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="A" id="type-a" />
                                    <Label htmlFor="type-a">Factura A</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="B" id="type-b" />
                                    <Label htmlFor="type-b">Factura B</Label>
                                </div>
                            </RadioGroup>
                            <FieldError errors={state.errors?.invoiceType} />
                        </div>
                        
                        <div className="space-y-4 rounded-md border p-4">
                            <h4 className="font-semibold text-sm">Detalles del Pago</h4>
                            <div className="space-y-2">
                                <Label>Método de Pago Principal</Label>
                                <RadioGroup name="payment_method" defaultValue="Efectivo">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Efectivo" id="pay-efectivo" /><Label htmlFor="pay-efectivo">Efectivo</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Transferencia" id="pay-transfer" /><Label htmlFor="pay-transfer">Transferencia</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Tarjeta" id="pay-tarjeta" /><Label htmlFor="pay-tarjeta">Tarjeta</Label></div>
                                </RadioGroup>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="has_secondary_payment" name="has_secondary_payment" onCheckedChange={(checked) => setShowSecondaryPayment(!!checked)} />
                                <Label htmlFor="has_secondary_payment" className="text-sm font-normal">Se abonó con un método de pago secundario</Label>
                            </div>

                            {showSecondaryPayment && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Método de Pago Secundario</Label>
                                    <RadioGroup name="secondary_payment_method">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Efectivo" id="sec-pay-efectivo" /><Label htmlFor="sec-pay-efectivo">Efectivo</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Transferencia" id="sec-pay-transfer" /><Label htmlFor="sec-pay-transfer">Transferencia</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Tarjeta" id="sec-pay-tarjeta" /><Label htmlFor="sec-pay-tarjeta">Tarjeta</Label></div>
                                    </RadioGroup>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas Adicionales</Label>
                                <Textarea id="notes" name="notes" placeholder="Ej: Últimos 4 dígitos de la tarjeta, ID de transferencia, etc." />
                            </div>
                        </div>

                         <div className="mt-auto pt-4 border-t">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>TOTAL:</span>
                                <span>{formatPrice(selectedProducts.reduce((acc, p) => acc + p.total, 0))}</span>
                            </div>
                         </div>
                    </div>
                 </form>
                <DialogFooter className="col-span-1 md:col-span-2 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
