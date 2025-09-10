
'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Receipt, Search, X, Trash2 } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

type SelectedProduct = {
    product: Product;
    quantity: number;
    total: number;
}

const cardTypes = ["Visa", "MasterCard", "American Express", "Cabal", "Naranja", "Otra"];


function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || disabled} form="invoice-form">
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
    const router = useRouter();
    const [showSecondaryPayment, setShowSecondaryPayment] = useState(false);

    // State to manage payment method selection
    const [primaryPaymentMethod, setPrimaryPaymentMethod] = useState<string | undefined>();
    const [secondaryPaymentMethod, setSecondaryPaymentMethod] = useState<string | undefined>();

    // POS State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const productsInCartIds = selectedProducts.map(p => p.product.id);
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            p.available && 
            p.stock > 0 &&
            !productsInCartIds.includes(p.id)
        );
    }, [products, searchTerm, selectedProducts]);

    const addProductToInvoice = (product: Product) => {
        setSelectedProducts(currentProducts => {
            const existingProduct = currentProducts.find(p => p.product.id === product.id);
            if (existingProduct) {
                const newQuantity = existingProduct.quantity + 1;
                if (newQuantity > product.stock) {
                    toast({ title: "Stock insuficiente", description: `Solo quedan ${product.stock} unidades de ${product.name}.`, variant: "destructive" });
                    return currentProducts;
                }
                return currentProducts.map(p => p.product.id === product.id ? { ...p, quantity: newQuantity, total: newQuantity * p.product.precio_venta } : p);
            }
            if (product.stock < 1) {
                 toast({ title: "Stock insuficiente", description: `${product.name} no tiene stock disponible.`, variant: "destructive" });
                 return currentProducts;
            }
            return [...currentProducts, { product, quantity: 1, total: product.precio_venta }];
        });
        setSearchTerm('');
    }
    
    const updateProductQuantity = (productId: string, newQuantity: number) => {
        setSelectedProducts(currentProducts => {
            if (newQuantity === 0) {
                return currentProducts.filter(p => p.product.id !== productId);
            }

            return currentProducts.map(p => {
                if (p.product.id === productId) {
                    if (newQuantity > p.product.stock) {
                        toast({ title: "Stock insuficiente", description: `Solo quedan ${p.product.stock} unidades de ${p.product.name}.`, variant: "destructive" });
                        return { ...p, quantity: p.product.stock, total: p.product.stock * p.product.precio_venta };
                    }
                    return { ...p, quantity: newQuantity, total: newQuantity * p.product.precio_venta };
                }
                return p;
            });
        });
    }

    useEffect(() => {
        if (state?.message === 'success' && state.data) {
            toast({
                title: '¡Factura Creada!',
                description: "La factura ha sido generada exitosamente.",
            });
            setIsDialogOpen(false);
            router.push(`/admin/invoices/${state.data}`);
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, router]);
    
    const onDialogChange = (open: boolean) => {
        if (!open) {
            formRef.current?.reset();
            setShowSecondaryPayment(false);
            setSelectedProducts([]);
            setPrimaryPaymentMethod(undefined);
            setSecondaryPaymentMethod(undefined);
            const emptyState = { message: '' };
            (formAction as (prevState: any, formData: FormData) => void)(emptyState, new FormData());
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
    
    const QuantityControl = ({ item }: { item: SelectedProduct }) => {
        const handleQuantityChange = (newQuantity: number) => {
            if (!isNaN(newQuantity) && newQuantity >= 0) {
                updateProductQuantity(item.product.id, newQuantity);
            }
        };

        return (
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.quantity - 1)}>
                    {item.quantity === 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : '-'}
                </Button>
                <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
                    className="h-8 w-14 text-center"
                    min="0"
                    max={item.product.stock}
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                    +
                </Button>
            </div>
        );
    };

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
                 <form id="invoice-form" action={formAction} ref={formRef} className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                    <div className="flex flex-col gap-4 overflow-y-hidden pr-2">
                        <input type="hidden" name="products" value={JSON.stringify(selectedProducts.map(p => ({ productId: p.product.id, name: p.product.name, quantity: p.quantity, unitPrice: p.product.precio_venta, total: p.total })))} />

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
                                        {filteredProducts.length > 0 ? filteredProducts.map(p => (
                                            <div key={p.id} onClick={() => addProductToInvoice(p)} className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between">
                                                <div>
                                                    <p>{p.name}</p>
                                                    <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                                                </div>
                                                <span className="text-muted-foreground">{formatPrice(p.precio_venta)}</span>
                                            </div>
                                        )) : (
                                            <div className="px-4 py-2 text-muted-foreground">No se encontraron productos o ya están en la factura.</div>
                                        )}
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="space-y-4 rounded-md border p-4 flex-grow flex flex-col">
                             <Label>Productos en la Factura</Label>
                             <ScrollArea className="flex-grow">
                                {selectedProducts.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center h-full">
                                        <p>Aún no se han añadido productos.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedProducts.map(item => (
                                            <div key={item.product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                <div className="flex-grow">
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatPrice(item.product.precio_venta)} c/u
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <QuantityControl item={item} />
                                                    <p className="font-semibold w-24 text-right">{formatPrice(item.total)}</p>
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
                                <RadioGroup name="payment_method" defaultValue="Efectivo" onValueChange={setPrimaryPaymentMethod}>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Efectivo" id="pay-efectivo" /><Label htmlFor="pay-efectivo">Efectivo</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Transferencia" id="pay-transfer" /><Label htmlFor="pay-transfer">Transferencia</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Tarjeta" id="pay-tarjeta" /><Label htmlFor="pay-tarjeta">Tarjeta</Label></div>
                                </RadioGroup>
                            </div>
                            
                            {primaryPaymentMethod === 'Tarjeta' && (
                                <div className="space-y-2">
                                    <Label htmlFor="card_type">Tipo de Tarjeta</Label>
                                    <Select name="card_type">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo de tarjeta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cardTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}


                            <div className="flex items-center space-x-2">
                                <Checkbox id="has_secondary_payment" name="has_secondary_payment" onCheckedChange={(checked) => setShowSecondaryPayment(!!checked)} />
                                <Label htmlFor="has_secondary_payment" className="text-sm font-normal">Se abonó con un método de pago secundario</Label>
                            </div>

                            {showSecondaryPayment && (
                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Método de Pago Secundario</Label>
                                    <RadioGroup name="secondary_payment_method" onValueChange={setSecondaryPaymentMethod}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Efectivo" id="sec-pay-efectivo" /><Label htmlFor="sec-pay-efectivo">Efectivo</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Transferencia" id="sec-pay-transfer" /><Label htmlFor="sec-pay-transfer">Transferencia</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="Tarjeta" id="sec-pay-tarjeta" /><Label htmlFor="sec-pay-tarjeta">Tarjeta</Label></div>
                                    </RadioGroup>
                                    {secondaryPaymentMethod === 'Tarjeta' && (
                                        <div className="space-y-2 pt-2">
                                            <Label htmlFor="secondary_card_type">Tipo de Tarjeta (Secundaria)</Label>
                                            <Select name="secondary_card_type">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona tipo de tarjeta" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cardTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
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
                <DialogFooter className="mt-4 border-t pt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <SubmitButton disabled={selectedProducts.length === 0} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
