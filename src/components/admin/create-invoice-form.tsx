'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Search, Trash2, User, Percent } from 'lucide-react';
import { createInvoice } from '@/lib/invoice-actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { Client, Product, CashAccount, Service, Seller } from '@/lib/definitions';
import { formatPrice } from '@/lib/utils';
import { Input } from '../ui/input';
import { applyPromotions } from '@/lib/promotions-engine';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

type SelectedProduct = {
    product: Product | Service;
    quantity: number;
    manualDiscount: number; // New field for manual discount per item
    manualDiscountType: 'amount' | 'percentage';
    automaticDiscount: number;
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
    customers: Client[];
    products: Product[];
    services?: Service[];
    cashAccounts?: CashAccount[];
    sellers?: Seller[];
    selectedCustomerId?: string;
    setOpen?: (open: boolean) => void;
    asPage?: boolean;
}

export function CreateInvoiceForm({ customers, products, services = [], cashAccounts = [], sellers = [], selectedCustomerId, setOpen, asPage = false }: CreateInvoiceFormProps) {
    const [state, formAction] = useActionState(createInvoice, { message: '' });
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [selectedClientId, setSelectedClientId] = useState<string | undefined>(selectedCustomerId);
    const [invoiceTypeState, setInvoiceTypeState] = useState<'A' | 'B' | 'C'>('B');
    const [clientFirstName, setClientFirstName] = useState<string>('');
    const [clientLastName, setClientLastName] = useState<string>('');
    const [clientDocType, setClientDocType] = useState<'DNI' | 'CUIT' | 'CUIL' | 'NN'>('NN');
    const [clientDocNumber, setClientDocNumber] = useState<string>('');
    const [vatType, setVatType] = useState<'consumidor_final' | 'exento' | 'monotributo' | 'responsable_inscripto'>('consumidor_final');
    const [vatRate, setVatRate] = useState<number>(0); // % IVA
    const [paymentCondition, setPaymentCondition] = useState<string>('');
    const [selectedCashAccount, setSelectedCashAccount] = useState<string>('');
    const [selectedSellerId, setSelectedSellerId] = useState<string>('');
    const [sellerCommission, setSellerCommission] = useState<number | string>('');

    // POS State
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [selectedServices, setSelectedServices] = useState<SelectedProduct[]>([]);
    
    // Discounts state
    const [generalDiscount, setGeneralDiscount] = useState<number>(0);
    const [generalDiscountType, setGeneralDiscountType] = useState<'amount' | 'percentage'>('amount');

    const supabase = createClient();
    
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

    const filteredServices = useMemo(() => {
        if (!serviceSearch) return [];
        const inCartIds = selectedServices.map(s => s.product.id);
        return services.filter(s => 
            s.name.toLowerCase().includes(serviceSearch.toLowerCase()) &&
            s.available &&
            !inCartIds.includes(s.id)
        );
    }, [services, serviceSearch, selectedServices]);

    // Aplicar promociones automáticas cuando cambian los productos
    useEffect(() => {
        const applyAutoPromotions = async () => {
            const allItems = [...selectedProducts, ...selectedServices];
            const cartItems = allItems.map(item => ({
                productId: item.product.id.toString(),
                quantity: item.quantity,
                unitPrice: Number(item.product.precio_venta),
                categoryId: (item.product as Product).category,
                subcategoryId: (item.product as Product).subcategory
            }));

            try {
                const { lineDiscounts } = await applyPromotions({
                    supabase,
                    items: cartItems,
                    branchId: '1'
                });

                setSelectedProducts(prev => 
                    prev.map(item => ({
                        ...item,
                        automaticDiscount: lineDiscounts[item.product.id.toString()] || 0,
                    }))
                );
                 setSelectedServices(prev => 
                    prev.map(item => ({
                        ...item,
                        automaticDiscount: lineDiscounts[item.product.id.toString()] || 0,
                    }))
                );

            } catch (error) {
                console.error('Error al aplicar promociones:', error);
            }
        };
        
        if (selectedProducts.length > 0 || selectedServices.length > 0) {
            applyAutoPromotions();
        }
    }, [selectedProducts.map(p => p.quantity).join(), selectedServices.map(s => s.quantity).join()]);

    
    const subtotal = useMemo(() => {
        const sp = selectedProducts.reduce((acc, p) => acc + (p.product.precio_venta * p.quantity), 0);
        const ss = selectedServices.reduce((acc, p) => acc + (p.product.precio_venta * p.quantity), 0);
        return sp + ss;
    }, [selectedProducts, selectedServices]);
    
    const discountsTotal = useMemo(() => {
        const itemDiscounts = [...selectedProducts, ...selectedServices].reduce((acc, p) => {
            const itemSubtotal = p.product.precio_venta * p.quantity;
            const manualDiscountAmount = p.manualDiscountType === 'percentage' ? itemSubtotal * (p.manualDiscount / 100) : p.manualDiscount;
            return acc + p.automaticDiscount + manualDiscountAmount;
        }, 0);

        const generalDiscountAmount = generalDiscountType === 'percentage' ? subtotal * (generalDiscount / 100) : generalDiscount;
        
        return itemDiscounts + generalDiscountAmount;
    }, [selectedProducts, selectedServices, generalDiscount, generalDiscountType, subtotal]);

    const vatAmount = useMemo(() => Number(((subtotal - discountsTotal) * (vatRate / 100)).toFixed(2)), [subtotal, discountsTotal, vatRate]);
    const grandTotal = useMemo(() => Number((subtotal - discountsTotal + vatAmount).toFixed(2)), [subtotal, discountsTotal, vatAmount]);

    const addProductToInvoice = (product: Product) => {
        setSelectedProducts(currentProducts => {
            const existingProduct = currentProducts.find(p => p.product.id === product.id);
            if (existingProduct) {
                const newQuantity = existingProduct.quantity + 1;
                if (newQuantity > product.stock) {
                    toast({ title: "Stock insuficiente", description: `Solo quedan ${product.stock} unidades de ${product.name}.`, variant: "destructive" });
                    return currentProducts;
                }
                return currentProducts.map(p => p.product.id === product.id ? { ...p, quantity: newQuantity } : p);
            }
            if (product.stock < 1) {
                 toast({ title: "Stock insuficiente", description: `${product.name} no tiene stock disponible.`, variant: "destructive" });
                 return currentProducts;
            }
            return [...currentProducts, { product, quantity: 1, manualDiscount: 0, manualDiscountType: 'amount', automaticDiscount: 0, total: product.precio_venta }];
        });
        setSearchTerm('');
    }

    const addServiceToInvoice = (service: Service) => {
        setSelectedServices(current => {
            const existing = current.find(s => s.product.id === service.id);
            if (existing) {
                const newQuantity = existing.quantity + 1;
                return current.map(s => s.product.id === service.id ? { ...s, quantity: newQuantity, total: Math.max(0, newQuantity * service.precio_venta - (s.manualDiscount || 0)) } : s);
            }
            return [...current, { product: { ...service, stock: 1, available: true } as any, quantity: 1, manualDiscount: 0, manualDiscountType: 'amount', automaticDiscount: 0, total: service.precio_venta }];
        });
        setServiceSearch('');
    }
    
    const updateProductQuantity = (productId: string, newQuantity: number) => {
        setSelectedProducts(currentProducts => {
            if (newQuantity <= 0) {
                return currentProducts.filter(p => p.product.id !== productId);
            }

            return currentProducts.map(p => {
                if (p.product.id === productId) {
                    if (newQuantity > (p.product as Product).stock) {
                        toast({
                            title: "Stock insuficiente",
                            description: `No hay suficiente stock de ${p.product.name}. Stock disponible: ${(p.product as Product).stock}`,
                            variant: "destructive"
                        });
                        return { ...p, quantity: (p.product as Product).stock };
                    }
                    return { ...p, quantity: newQuantity };
                }
                return p;
            });
        });
    };

    const updateServiceQuantity = (serviceId: string, newQuantity: number) => {
        setSelectedServices(currentServices => {
            if (newQuantity <= 0) {
                return currentServices.filter(s => s.product.id !== serviceId);
            }
            return currentServices.map(s => {
                if (s.product.id === serviceId) {
                    return { ...s, quantity: newQuantity };
                }
                return s;
            });
        });
    };
    
    useEffect(() => {
        const recalculateTotals = (items: SelectedProduct[]) => {
            return items.map(p => {
                const itemSubtotal = p.quantity * p.product.precio_venta;
                const manualDiscountAmount = p.manualDiscountType === 'percentage'
                    ? itemSubtotal * (p.manualDiscount / 100)
                    : p.manualDiscount;
                return {
                    ...p,
                    total: Math.max(0, itemSubtotal - p.automaticDiscount - manualDiscountAmount)
                };
            });
        };
        setSelectedProducts(recalculateTotals);
        setSelectedServices(recalculateTotals);
    }, [
        selectedProducts.map(p => `${p.quantity}-${p.manualDiscount}-${p.manualDiscountType}-${p.automaticDiscount}`).join(),
        selectedServices.map(s => `${s.quantity}-${s.manualDiscount}-${s.manualDiscountType}-${s.automaticDiscount}`).join()
    ]);


    useEffect(() => {
        if (state?.message === 'success' && state.data) {
            toast({
                title: '¡Factura Creada!',
                description: "La factura ha sido generada exitosamente.",
            });
            if (setOpen) setOpen(false);
            router.push(`/admin/invoices/${state.data}`);
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, router, setOpen]);

    
    useEffect(() => {
        if (vatType === 'consumidor_final') {
            setInvoiceTypeState('B');
        } else {
             const client = customers.find(c => String(c.id) === selectedClientId);
             setInvoiceTypeState(client?.default_invoice_type || 'B');
        }
    }, [vatType, selectedClientId, customers]);


    useEffect(() => {
        if (!selectedClientId) return;
        const c = customers.find(c => String(c.id) === String(selectedClientId));
        if (!c) return;

        setClientFirstName(c.name || '');
        setClientLastName(c.last_name || '');
        setClientDocType((c.document_type as any) || 'NN');
        setClientDocNumber(c.document_number || '');
        
        if (c.iva_condition) {
            switch(c.iva_condition) {
                case "Responsable Inscripto": setVatType('responsable_inscripto'); break;
                case "Monotributo": setVatType('monotributo'); break;
                case "Exento": setVatType('exento'); break;
                case "Consumidor Final":
                default: setVatType('consumidor_final'); break;
            }
        } else {
            setVatType('consumidor_final');
        }

    }, [selectedClientId, customers]);

     useEffect(() => {
        if (!selectedSellerId) {
            setSellerCommission('');
            return;
        }
        const seller = sellers.find(s => String(s.id) === selectedSellerId);
        if (!seller) return;
        
        const commission = paymentCondition === 'Efectivo' 
            ? seller.cash_sale_commission 
            : seller.collection_commission;
            
        setSellerCommission(commission ?? '');
    }, [selectedSellerId, paymentCondition, sellers]);
    
    const QuantityControl = ({ item, isService }: { item: SelectedProduct, isService: boolean }) => {
        const handleQuantityChange = (newQuantity: number) => {
            if (!isNaN(newQuantity)) {
                 if(!isService) {
                    updateProductQuantity(item.product.id, newQuantity);
                } else {
                    updateServiceQuantity(item.product.id, newQuantity);
                }
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
                    max={isService ? undefined : (item.product as Product).stock}
                />
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.quantity + 1)} disabled={!isService && item.quantity >= (item.product as Product).stock}>
                    +
                </Button>
            </div>
        );
    };

    const formEl = (
                <form id="invoice-form" action={formAction} ref={formRef} className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                     <input type="hidden" name="products" value={JSON.stringify(
                        [...selectedProducts, ...selectedServices].map(p => ({
                            productId: p.product.id,
                            name: p.product.name,
                            quantity: p.quantity,
                            unitPrice: p.product.precio_venta,
                            manualDiscount: p.manualDiscount,
                            manualDiscountType: p.manualDiscountType,
                            automaticDiscount: p.automaticDiscount,
                            isService: !p.product.hasOwnProperty('stock'),
                            total: p.total
                        }))
                    )} />
                    <input type="hidden" name="client_first_name" value={clientFirstName} />
                    <input type="hidden" name="client_last_name" value={clientLastName} />
                    <input type="hidden" name="client_document_type" value={clientDocType} />
                    <input type="hidden" name="client_document_number" value={clientDocNumber} />
                    <input type="hidden" name="vat_type" value={vatType} />
                    <input type="hidden" name="vat_rate" value={String(vatRate)} />
                    <input type="hidden" name="payment_condition" value={paymentCondition} />
                    <input type="hidden" name="cash_account_code" value={selectedCashAccount} />
                    <input type="hidden" name="seller_id" value={selectedSellerId} />
                    <input type="hidden" name="seller_commission" value={String(sellerCommission)} />
                    <input type="hidden" name="general_discount" value={String(generalDiscount)} />
                    <input type="hidden" name="general_discount_type" value={generalDiscountType} />

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

                    <div className="space-y-4 rounded-md border p-4">
                            <Label>Añadir Servicios</Label>
                            <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar servicio por nombre..."
                                className="pl-10"
                                value={serviceSearch}
                                onChange={e => setServiceSearch(e.target.value)}
                            />
                            {serviceSearch && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredServices.length > 0 ? filteredServices.map(s => (
                                        <div key={s.id} onClick={() => addServiceToInvoice(s)} className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between">
                                            <div>
                                                <p>{s.name}</p>
                                            </div>
                                            <span className="text-muted-foreground">{formatPrice(s.precio_venta)}</span>
                                        </div>
                                    )) : (
                                        <div className="px-4 py-2 text-muted-foreground">No se encontraron servicios o ya están en la factura.</div>
                                    )}
                                </div>
                            )}
                            </div>
                    </div>

                    <div className="space-y-4 rounded-md border p-4 flex-grow flex flex-col">
                            <Label>Productos y Servicios en la Factura</Label>
                             <ScrollArea className="flex-grow">
                                {[...selectedProducts, ...selectedServices].length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center h-full">
                                        <p>Aún no se han añadido productos ni servicios.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                    {[...selectedProducts, ...selectedServices].map((item, index) => (
                                        <div key={item.product.id} className="p-2 rounded-md bg-muted/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-grow">
                                                    <p className="font-medium">{item.product.name} {item.product.hasOwnProperty('stock') ? '' : <span className="text-xs text-muted-foreground">(Servicio)</span>}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatPrice(item.product.precio_venta)} c/u
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <QuantityControl item={item} isService={!item.product.hasOwnProperty('stock')} />
                                                    <p className="font-semibold w-24 text-right">{formatPrice(item.product.precio_venta * item.quantity)}</p>
                                                </div>
                                            </div>
                                            <div className='flex justify-end items-center gap-2 mt-1'>
                                                <Label htmlFor={`discount-${index}`} className='text-xs'>Desc. manual:</Label>
                                                 <Input 
                                                    id={`discount-${index}`} 
                                                    type="number" 
                                                    className='h-7 w-20' 
                                                    value={item.manualDiscount}
                                                    onChange={e => {
                                                        const newItems = item.product.hasOwnProperty('stock') ? [...selectedProducts] : [...selectedServices];
                                                        const currentItem = newItems.find(i => i.product.id === item.product.id);
                                                        if (currentItem) {
                                                            currentItem.manualDiscount = parseFloat(e.target.value) || 0;
                                                            if (item.product.hasOwnProperty('stock')) setSelectedProducts(newItems as any); else setSelectedServices(newItems as any);
                                                        }
                                                    }}
                                                 />
                                                <Select
                                                    value={item.manualDiscountType}
                                                    onValueChange={(val: 'amount' | 'percentage') => {
                                                        const newItems = item.product.hasOwnProperty('stock') ? [...selectedProducts] : [...selectedServices];
                                                        const currentItem = newItems.find(i => i.product.id === item.product.id);
                                                        if (currentItem) {
                                                            currentItem.manualDiscountType = val;
                                                            if (item.product.hasOwnProperty('stock')) setSelectedProducts(newItems as any); else setSelectedServices(newItems as any);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className='h-7 w-20 text-xs'><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="amount">$</SelectItem>
                                                        <SelectItem value="percentage">%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                             {item.automaticDiscount > 0 && <p className='text-xs text-right text-destructive'>- {formatPrice(item.automaticDiscount)} (promo auto)</p>}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </ScrollArea>
                    </div>
                </div>
                
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                    <div className="space-y-4 rounded-md border p-4">
                        <Label>Datos del Cliente</Label>
                        <div className="space-y-2">
                            <Label htmlFor="clientId">Buscar Cliente</Label>
                            <Select name="clientId" value={selectedClientId} onValueChange={(val) => setSelectedClientId(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={String(customer.id)}>{customer.name} {customer.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError errors={state?.errors?.clientId} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input placeholder="Nombre" value={clientFirstName} onChange={e => setClientFirstName(e.target.value)} />
                            <Input placeholder="Apellido" value={clientLastName} onChange={e => setClientLastName(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-[160px_1fr] gap-3">
                            <RadioGroup className="grid grid-cols-2 gap-2" value={clientDocType} onValueChange={(v) => setClientDocType(v as any)}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="DNI" id="doc-dni" /><Label htmlFor="doc-dni">DNI</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="CUIT" id="doc-cuit" /><Label htmlFor="doc-cuit">CUIT</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="CUIL" id="doc-cuil" /><Label htmlFor="doc-cuil">CUIL</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="NN" id="doc-nn" /><Label htmlFor="doc-nn">NN</Label></div>
                            </RadioGroup>
                            <Input placeholder="Número de documento" value={clientDocNumber} onChange={e => setClientDocNumber(e.target.value)} disabled={clientDocType === 'NN'} />
                        </div>
                    </div>
                    
                    <div className="space-y-4 rounded-md border p-4">
                        <Label>Condición Fiscal</Label>
                        <div className="space-y-2">
                            <Label>Condición frente al IVA</Label>
                            <Select 
                                value={vatType} 
                                onValueChange={(value: 'consumidor_final' | 'exento' | 'monotributo' | 'responsable_inscripto') => {
                                    setVatType(value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                                    <SelectItem value="exento">Exento</SelectItem>
                                    <SelectItem value="monotributo">Monotributo</SelectItem>
                                    <SelectItem value="responsable_inscripto">Responsable Inscripto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Tipo de Factura</Label>
                            </div>
                             <RadioGroup 
                                name="invoiceType" 
                                value={invoiceTypeState} 
                                onValueChange={(v) => setInvoiceTypeState(v as 'A'|'B'|'C')}
                                className="grid grid-cols-3"
                                disabled={vatType === 'consumidor_final'}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="A" id="type-a" />
                                    <Label htmlFor="type-a">Factura A</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="B" id="type-b" />
                                    <Label htmlFor="type-b">Factura B</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="C" id="type-c" />
                                    <Label htmlFor="type-c">Factura C</Label>
                                </div>
                            </RadioGroup>
                            <FieldError errors={state?.errors?.invoiceType} />
                        </div>
                    </div>
                    
                    
                    <div className="space-y-4 rounded-md border p-4">
                        <div className="space-y-2">
                            <Label>Condición de Venta</Label>
                            <Select value={paymentCondition} onValueChange={setPaymentCondition}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una condición" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                                    <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                                    <SelectItem value="Tarjeta de crédito">Tarjeta de crédito</SelectItem>
                                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError errors={state?.errors?.payment_condition} />
                        </div>
                         <div className="space-y-2">
                            <Label>Cuenta de Caja</Label>
                            <Select value={selectedCashAccount} onValueChange={setSelectedCashAccount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una cuenta de caja" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cashAccounts.map(acc => (
                                        <SelectItem key={acc.code} value={acc.code}>
                                            {acc.description}{acc.account_type ? ` (${acc.account_type})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <FieldError errors={state?.errors?.cash_account_code} />
                        </div>
                         <div className="space-y-2">
                            <Label>Vendedor</Label>
                            <Select value={selectedSellerId} onValueChange={setSelectedSellerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un vendedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sellers.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name} {s.last_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedSellerId && (
                            <div className="space-y-2">
                                <Label htmlFor="seller_commission">Comisión Vendedor (%)</Label>
                                <div className='relative'>
                                    <Input id="seller_commission" type="number" value={sellerCommission} onChange={e => setSellerCommission(e.target.value)} className="pl-7"/>
                                    <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas Adicionales</Label>
                            <Textarea id="notes" name="notes" placeholder="Ej: Últimos 4 dígitos de la tarjeta, ID de transferencia, etc." />
                        </div>
                         <div className="space-y-2">
                            <Label>Descuento General</Label>
                            <div className='flex gap-2'>
                                <Input type="number" value={generalDiscount} onChange={e => setGeneralDiscount(parseFloat(e.target.value) || 0)} className="flex-grow"/>
                                <Select value={generalDiscountType} onValueChange={val => setGeneralDiscountType(val as 'amount' | 'percentage')}>
                                    <SelectTrigger className='w-24'><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="amount">$</SelectItem>
                                        <SelectItem value="percentage">%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                        <div className="mt-auto pt-4 border-t space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-destructive">
                                <span>Descuentos</span>
                                <span>- {formatPrice(discountsTotal)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span>{formatPrice(grandTotal)}</span>
                            </div>
                        </div>
                </div>
                </form>
    )

    if (asPage) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Crear Nueva Factura</h1>
                    <p className="text-muted-foreground">Completa los detalles para generar una nueva factura.</p>
                </div>
                <div className="bg-card rounded-lg border p-4 sm:p-6 flex flex-col max-h-[calc(100vh-12rem)]">
                    {formEl}
                    <div className="mt-4 border-t pt-4 flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => history.back()}>Cancelar</Button>
                        <SubmitButton disabled={selectedProducts.length === 0 && selectedServices.length === 0} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>Crear Nueva Factura</DialogTitle>
                <DialogDescription>
                    Completa los detalles para generar una nueva factura.
                </DialogDescription>
            </DialogHeader>
            {formEl}
            <DialogFooter className="mt-4 border-t pt-4">
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <SubmitButton disabled={selectedProducts.length === 0 && selectedServices.length === 0} />
            </DialogFooter>
        </DialogContent>
    )

}
