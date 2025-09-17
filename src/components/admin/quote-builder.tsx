
'use client';
import { useState, useMemo, useEffect, useActionState, useRef } from 'react';
import type { Product, Service, Client, Currency } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPrice } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { saveQuote } from '@/lib/actions';
import { useRouter } from 'next/navigation';

type QuoteItem = {
    id: string;
    name: string;
    type: 'product' | 'service';
    unit_price: number;
    quantity: number;
    total: number;
    max_quantity?: number;
};

export function QuoteBuilder({ products, services, clients, currencies }: { products: Product[], services: Service[], clients: Client[], currencies: Currency[] }) {
    const [state, formAction] = useActionState(saveQuote, { message: '' });
    const { toast } = useToast();
    const router = useRouter();

    const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
    const [title, setTitle] = useState('');
    const [validUntil, setValidUntil] = useState<Date | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('ARS');

    const availableItems = useMemo(() => {
        const productItems = products.filter(p => p.available && p.stock > 0).map(p => ({
            id: p.id,
            name: p.name,
            type: 'product' as const,
            unit_price: p.precio_venta,
            max_quantity: p.stock
        }));
        const serviceItems = services.filter(s => s.available).map(s => ({
            id: s.id,
            name: s.name,
            type: 'service' as const,
            unit_price: s.precio_venta
        }));
        
        const selectedItemIds = new Set(items.map(i => `${i.type}-${i.id}`));
        
        return [...productItems, ...serviceItems].filter(i => 
            !selectedItemIds.has(`${i.type}-${i.id}`) &&
            i.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, services, items, searchTerm]);
    
    const total = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);

    const addItem = (item: (typeof availableItems)[0]) => {
        setItems(prev => [...prev, { ...item, quantity: 1, total: item.unit_price }]);
        setSearchTerm('');
    };
    
    const updateQuantity = (itemId: string, itemType: 'product' | 'service', newQuantity: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === itemId && item.type === itemType) {
                if (newQuantity < 1) return { ...item, quantity: 1, total: item.unit_price };
                if (item.max_quantity && newQuantity > item.max_quantity) {
                    toast({
                        title: "Stock insuficiente",
                        description: `Solo quedan ${item.max_quantity} unidades de ${item.name}.`,
                        variant: "destructive"
                    });
                    return { ...item, quantity: item.max_quantity, total: item.max_quantity * item.unit_price };
                }
                return { ...item, quantity: newQuantity, total: newQuantity * item.unit_price };
            }
            return item;
        }));
    };
    
    const removeItem = (itemId: string, itemType: 'product' | 'service') => {
        setItems(prev => prev.filter(item => !(item.id === itemId && item.type === itemType)));
    };

    useEffect(() => {
        if (state?.message === 'success' && state.data) {
            toast({
                title: '¡Presupuesto Guardado!',
                description: "El presupuesto ha sido guardado exitosamente.",
            });
            // Optionally redirect or reset form
            // router.push(`/admin/quotes/${state.data.id}`);
            resetForm();
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, router]);
    
    const resetForm = () => {
        setSelectedClientId(undefined);
        setTitle('');
        setValidUntil(undefined);
        setItems([]);
        setSearchTerm('');
        setSelectedCurrency('ARS');
    }

    const formRef = useRef<HTMLFormElement>(null);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        formData.set('items', JSON.stringify(items));
        formAction(formData);
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título del Presupuesto</Label>
                            <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Diseño de jardín frontal" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client_id">Cliente</Label>
                            <Select name="client_id" onValueChange={setSelectedClientId} value={selectedClientId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} {c.last_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valid_until">Válido Hasta</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !validUntil && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {validUntil ? format(validUntil, "PPP") : <span>Selecciona una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={validUntil} onSelect={setValidUntil} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="valid_until" value={validUntil?.toISOString()} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select name="currency" onValueChange={setSelectedCurrency} value={selectedCurrency}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.description} ({c.code})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Añadir Artículo</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar productos o servicios..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                             {searchTerm && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {availableItems.length > 0 ? availableItems.map(item => (
                                        <div key={`${item.type}-${item.id}`} onClick={() => addItem(item)} className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between">
                                            <div>
                                                <p>{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.type === 'product' ? 'Producto' : 'Servicio'}</p>
                                            </div>
                                            <span className="text-muted-foreground">{formatPrice(item.unit_price, selectedCurrency)}</span>
                                        </div>
                                    )) : (
                                        <div className="px-4 py-2 text-muted-foreground">No se encontraron items.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="border rounded-md">
                        <ScrollArea className="h-72">
                            {items.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">Aún no se han añadido items al presupuesto.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="border-b">
                                        <tr className="text-left">
                                            <th className="p-2 font-medium">Artículo</th>
                                            <th className="p-2 font-medium w-32">Cantidad</th>
                                            <th className="p-2 font-medium text-right">P. Unitario</th>
                                            <th className="p-2 font-medium text-right">Total</th>
                                            <th className="p-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={`${item.type}-${item.id}`} className="border-b">
                                                <td className="p-2">{item.name}</td>
                                                <td className="p-2">
                                                    <Input type="number" value={item.quantity} min="1" max={item.max_quantity}
                                                        onChange={e => updateQuantity(item.id, item.type, parseInt(e.target.value, 10))}
                                                        className="h-8 w-24"
                                                    />
                                                </td>
                                                <td className="p-2 text-right font-mono">{formatPrice(item.unit_price, selectedCurrency)}</td>
                                                <td className="p-2 text-right font-mono font-semibold">{formatPrice(item.total, selectedCurrency)}</td>
                                                <td className="p-2 text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id, item.type)}>
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </ScrollArea>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <div className="w-full max-w-sm space-y-2">
                            <div className="flex justify-between font-semibold text-lg">
                                <span>TOTAL ({selectedCurrency})</span>
                                <span className="font-mono">{formatPrice(total, selectedCurrency)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={resetForm}>Limpiar</Button>
                    <Button type="submit" disabled={items.length === 0 || !selectedClientId}>Guardar Presupuesto</Button>
                </CardFooter>
            </Card>
        </form>
    );
}
