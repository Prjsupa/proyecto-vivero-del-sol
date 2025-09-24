
'use client';
import { useState, useMemo, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import type { Product, Service, Client, Currency, UnitOfMeasure, UnitOfTime, UnitOfMass, UnitOfVolume } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, Loader2, PlusCircle } from 'lucide-react';
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

type ResourceItem = {
    id: string;
    name: string;
    quantity: number;
    unitType: 'measure' | 'time' | 'mass' | 'volume' | '';
    unitCode: string;
    cost: number;
}

type Units = {
    measure: UnitOfMeasure[];
    time: UnitOfTime[];
    mass: UnitOfMass[];
    volume: UnitOfVolume[];
}

export function QuoteBuilder({ products, services, clients, currencies, units }: { products: Product[], services: Service[], clients: Client[], currencies: Currency[], units: Units }) {
    const [state, formAction] = useActionState(saveQuote, { message: '' });
    const { toast } = useToast();
    const router = useRouter();

    const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
    const [title, setTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [resources, setResources] = useState<ResourceItem[]>([]);
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
    
    const itemsTotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
    const resourcesTotal = useMemo(() => resources.reduce((acc, resource) => acc + (Number(resource.cost) || 0), 0), [resources]);
    const total = useMemo(() => itemsTotal + resourcesTotal, [itemsTotal, resourcesTotal]);

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

    const addResource = () => {
        setResources(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1, unitType: '', unitCode: '', cost: 0 }]);
    };

    const updateResource = (id: string, field: keyof ResourceItem, value: any) => {
        setResources(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const removeResource = (id: string) => {
        setResources(prev => prev.filter(r => r.id !== id));
    };


    useEffect(() => {
        if (state?.message === 'success' && state.data) {
            toast({
                title: '¡Presupuesto Guardado!',
                description: "El presupuesto ha sido guardado exitosamente.",
            });
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
        setItems([]);
        setResources([]);
        setSearchTerm('');
        setSelectedCurrency('ARS');
    }

    const formRef = useRef<HTMLFormElement>(null);
    
    const { pending } = useFormStatus();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        formData.set('items', JSON.stringify(items));
        formData.set('resources', JSON.stringify(resources));
        formAction(formData);
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <div className="grid md:grid-cols-3 gap-4">
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
                <CardContent className="space-y-6">
                    {/* Items Section */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Artículos</Label>
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
                        <div className="border rounded-md">
                            <ScrollArea className="h-48">
                                {items.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10">Aún no se han añadido artículos.</div>
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
                    </div>
                    {/* Resources Section */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Recursos</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addResource}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Añadir Recurso
                            </Button>
                        </div>
                        <div className="border rounded-md">
                            <ScrollArea className="h-48">
                               {resources.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10">Aún no se han añadido recursos.</div>
                                ) : (
                                    <div className="p-2 space-y-2">
                                        {resources.map((resource, index) => (
                                            <div key={resource.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-muted/50">
                                                <Input placeholder="Recurso" value={resource.name} onChange={e => updateResource(resource.id, 'name', e.target.value)} className="h-8 col-span-3"/>
                                                <Input type="number" placeholder="Cant." value={resource.quantity} onChange={e => updateResource(resource.id, 'quantity', e.target.value)} className="h-8 col-span-1"/>
                                                <Select value={resource.unitType} onValueChange={val => updateResource(resource.id, 'unitType', val)}>
                                                    <SelectTrigger className="h-8 col-span-2"><SelectValue placeholder="Tipo Unidad" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="measure">Medida</SelectItem>
                                                        <SelectItem value="time">Tiempo</SelectItem>
                                                        <SelectItem value="mass">Masa</SelectItem>
                                                        <SelectItem value="volume">Volumen</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select 
                                                    value={resource.unitCode} 
                                                    onValueChange={val => updateResource(resource.id, 'unitCode', val)}
                                                    disabled={!resource.unitType}
                                                >
                                                    <SelectTrigger className="h-8 col-span-2"><SelectValue placeholder="Unidad" /></SelectTrigger>
                                                    <SelectContent>
                                                        {resource.unitType && units[resource.unitType].map(u => (
                                                            <SelectItem key={u.code} value={u.code}>{u.description}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Input type="number" placeholder="Costo" value={resource.cost || ''} onChange={e => updateResource(resource.id, 'cost', parseFloat(e.target.value))} className="h-8 col-span-2"/>
                                                <Button variant="ghost" size="icon" onClick={() => removeResource(resource.id)} className="col-span-1">
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                    {/* Totals */}
                    <div className="flex justify-end pt-4 border-t">
                        <div className="w-full max-w-sm space-y-2">
                             <div className="flex justify-between">
                                <span>Subtotal Artículos</span>
                                <span className="font-mono">{formatPrice(itemsTotal, selectedCurrency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subtotal Recursos</span>
                                <span className="font-mono">{formatPrice(resourcesTotal, selectedCurrency)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                                <span>TOTAL ({selectedCurrency})</span>
                                <span className="font-mono">{formatPrice(total, selectedCurrency)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={resetForm}>Limpiar</Button>
                    <Button type="submit" disabled={pending || (items.length === 0 && resources.length === 0) || !selectedClientId}>
                        {pending ? <><Loader2 className="animate-spin mr-2" />Guardando...</> : 'Guardar Presupuesto'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
