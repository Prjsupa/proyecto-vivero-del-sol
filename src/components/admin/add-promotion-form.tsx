'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, PlusCircle, Loader2, Trash2, Calendar as CalendarIcon, Search, X, ChevronsUpDown } from 'lucide-react';
import { addPromotion } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import type { Product, Service } from '@/lib/definitions';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from "date-fns"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import type { DateRange } from 'react-day-picker';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear Promoción'}
        </Button>
    )
}

interface AddPromotionFormProps {
    products: Product[];
    services: Service[];
    productCategories: string[];
    productSubcategories: string[];
    serviceCategories: string[];
}

type DiscountTier = {
    quantity: string;
    percentage: string;
}

export function AddPromotionForm({ products, services, productCategories, productSubcategories, serviceCategories }: AddPromotionFormProps) {
    const [state, formAction] = useActionState(addPromotion, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [discountType, setDiscountType] = useState<string>('');
    const [applyToType, setApplyToType] = useState<string>('');
    const [selectedApplyToIds, setSelectedApplyToIds] = useState<Set<string>>(new Set());
    const [usageLimitType, setUsageLimitType] = useState<string>('unlimited');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [progressiveTiers, setProgressiveTiers] = useState<DiscountTier[]>([{ quantity: '', percentage: '' }]);
    const [xForYTake, setXForYTake] = useState('');
    const [xForYPay, setXForYPay] = useState('');
    const [customTag, setCustomTag] = useState('');


    useEffect(() => {
        if (state?.message === 'success') {
            toast({ title: '¡Éxito!', description: state.data });
            setIsDialogOpen(false);
            resetFormState();
            window.location.reload();
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
             toast({ title: 'Error', description: state.message, variant: 'destructive' });
        }
    }, [state, toast]);

    const resetFormState = () => {
        formRef.current?.reset();
        setName('');
        setDiscountType('');
        setApplyToType('');
        setSelectedApplyToIds(new Set());
        setUsageLimitType('unlimited');
        setDate(undefined);
        setProgressiveTiers([{ quantity: '', percentage: '' }]);
        setXForYTake('');
        setXForYPay('');
        setCustomTag('');
    };

    const onDialogChange = (open: boolean) => {
        if (!open) resetFormState();
        setIsDialogOpen(open);
    }
    
    const handleApplyToTypeChange = (value: string) => {
        setApplyToType(value);
        setSelectedApplyToIds(new Set());
    }
    
    const handleMultiSelectToggle = (id: string) => {
        setSelectedApplyToIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    const addTier = () => {
        setProgressiveTiers([...progressiveTiers, { quantity: '', percentage: '' }]);
    };

    const removeTier = (index: number) => {
        const newTiers = progressiveTiers.filter((_, i) => i !== index);
        setProgressiveTiers(newTiers);
    };

    const handleTierChange = (index: number, field: keyof DiscountTier, value: string) => {
        const newTiers = [...progressiveTiers];
        newTiers[index][field] = value ?? '';
        setProgressiveTiers(newTiers);
    };
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Promoción
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Crear Nueva Promoción</DialogTitle>
                    <DialogDescription>
                        Completa los detalles para configurar una nueva promoción.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="flex-grow overflow-hidden flex flex-col">
                    <ScrollArea className="flex-grow pr-6 -mr-6">
                        <div className="space-y-4">
                            <input type="hidden" name="start_date" value={date?.from?.toISOString() ?? ''} />
                            <input type="hidden" name="end_date" value={date?.to?.toISOString() ?? ''} />
                            <input type="hidden" name="progressive_tiers" value={JSON.stringify(progressiveTiers)} />
                            <input type="hidden" name="apply_to_ids" value={Array.from(selectedApplyToIds).join(',')} />
                            
                            {/* General Info */}
                            <div className="space-y-4 border-b pb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre de la Promoción</Label>
                                    <Input id="name" name="name" placeholder="Ej: Promo Día de la Madre" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="is_active" name="is_active" defaultChecked />
                                    <Label htmlFor="is_active">Activa</Label>
                                </div>
                            </div>

                            {/* Discount Type */}
                            <div className="space-y-4 border-b pb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discount_type">Tipo de descuento</Label>
                                    <Select name="discount_type" onValueChange={setDiscountType}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="x_for_y">Llevá X y pagá Y (2x1, 3x2, etc.)</SelectItem>
                                            <SelectItem value="progressive_discount">Descuento progresivo por cantidad</SelectItem>
                                            <SelectItem value="price_discount" disabled>Descuento sobre precios</SelectItem>
                                            <SelectItem value="cross_selling" disabled>Cross selling</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {discountType === 'x_for_y' && (
                                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                                        <div className="space-y-2">
                                            <Label htmlFor="x_for_y_take">Llevando</Label>
                                            <Input id="x_for_y_take" name="x_for_y_take" type="number" min="1" placeholder="Ej: 3" value={xForYTake} onChange={(e) => setXForYTake(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="x_for_y_pay">Pagás</Label>
                                            <Input id="x_for_y_pay" name="x_for_y_pay" type="number" min="1" placeholder="Ej: 2" value={xForYPay} onChange={(e) => setXForYPay(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {discountType === 'progressive_discount' && (
                                    <div className="p-4 border rounded-md bg-muted/50 space-y-4">
                                        <div className="grid grid-cols-[1fr_1fr_auto] gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                            <p>Descuento</p>
                                            <p>Al comprar por lo menos</p>
                                        </div>
                                        {progressiveTiers.map((tier, index) => (
                                            <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                                                <div className="flex items-center w-full">
                                                    <Input id={`tier-percentage-${index}`} type="number" min="0" max="100" placeholder="10" value={tier.percentage} onChange={(e) => handleTierChange(index, 'percentage', e.target.value)} className="rounded-r-none" />
                                                    <div className="bg-gray-200 border border-l-0 border-input rounded-r-md px-3 py-2 text-sm text-muted-foreground">%</div>
                                                </div>

                                                <div className="flex items-center w-full">
                                                    <Input id={`tier-quantity-${index}`} type="number" min="1" placeholder="2" value={tier.quantity} onChange={(e) => handleTierChange(index, 'quantity', e.target.value)} className="rounded-r-none" />
                                                    <div className="bg-gray-200 border border-l-0 border-input rounded-r-md px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">Productos</div>
                                                </div>
                                                
                                                <Button variant="ghost" size="icon" onClick={() => removeTier(index)} type="button" className="shrink-0">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={addTier} type="button">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Nuevo descuento progresivo
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Apply To */}
                            <div className="space-y-4 border-b pb-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apply_to_type">Aplicar a</Label>
                                    <Select name="apply_to_type" onValueChange={handleApplyToTypeChange}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona dónde aplicar" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_store">Toda la tienda</SelectItem>
                                            <SelectItem value="all_products">Todos los productos</SelectItem>
                                            <SelectItem value="all_services">Todos los servicios</SelectItem>
                                            <SelectItem value="product_categories">Categorías de productos específicas</SelectItem>
                                            <SelectItem value="product_subcategories">Subcategorías de productos específicas</SelectItem>
                                            <SelectItem value="service_categories">Categorías de servicios específicas</SelectItem>
                                            <SelectItem value="products">Productos específicos</SelectItem>
                                            <SelectItem value="services">Servicios específicos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {['product_categories', 'product_subcategories', 'service_categories'].includes(applyToType) && (
                                    <MultiSelect
                                        placeholder={`Seleccionar ${applyToType === 'product_categories' ? 'categorías de producto' : applyToType === 'product_subcategories' ? 'subcategorías' : 'categorías de servicio'}...`}
                                        options={
                                            applyToType === 'product_categories' ? productCategories.map(c => ({ value: c, label: c })) :
                                            applyToType === 'product_subcategories' ? productSubcategories.map(s => ({ value: s, label: s })) :
                                            serviceCategories.map(c => ({ value: c, label: c }))
                                        }
                                        selected={selectedApplyToIds}
                                        onToggle={handleMultiSelectToggle}
                                    />
                                )}

                                {['products', 'services'].includes(applyToType) && (
                                    <ItemSelector
                                        items={applyToType === 'products' ? products : services}
                                        selectedIds={selectedApplyToIds}
                                        onToggle={handleMultiSelectToggle}
                                        placeholder={`Buscar ${applyToType === 'products' ? 'productos' : 'servicios'}...`}
                                    />
                                )}

                            </div>

                            {/* Limits */}
                            <div className="space-y-4 border-b pb-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="can_be_combined" name="can_be_combined" />
                                    <Label htmlFor="can_be_combined">Permitir combinar con otras promociones.</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label>Límites de uso</Label>
                                    <RadioGroup name="usage_limit_type" defaultValue="unlimited" onValueChange={setUsageLimitType}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="unlimited" id="limit-unlimited" />
                                            <Label htmlFor="limit-unlimited">Ilimitada</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="period" id="limit-period" />
                                            <Label htmlFor="limit-period">Definir período de la promoción</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {usageLimitType === 'period' && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? (<> {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")} </>) 
                                                : (format(date.from, "LLL dd, y"))
                                            ) : (<span>Selecciona un rango</span>)}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="range" selected={date} onSelect={setDate} initialFocus/>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            {/* Custom Tag */}
                            <div className="space-y-2">
                                <Label htmlFor="custom_tag">Etiqueta personalizada (Opcional)</Label>
                                <Input id="custom_tag" name="custom_tag" placeholder="Ej: ¡OFERTA!" value={customTag} onChange={(e) => setCustomTag(e.target.value)} />
                                <p className="text-xs text-muted-foreground">Esta etiqueta aparecerá en los productos/servicios en promoción.</p>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter className="shrink-0 border-t pt-4 mt-4">
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function MultiSelect({ placeholder, options, selected, onToggle }: { placeholder: string, options: { value: string, label: string }[], selected: Set<string>, onToggle: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    <span className='line-clamp-1 text-left'>{selected.size > 0 ? `${selected.size} seleccionado(s)` : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder={placeholder} />
                    <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem key={option.value} onSelect={() => onToggle(option.value)}>
                                    <Checkbox className="mr-2" checked={selected.has(option.value)} />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function ItemSelector({ items, selectedIds, onToggle, placeholder }: { items: (Product | Service)[], selectedIds: Set<string>, onToggle: (id: string) => void, placeholder: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    const selectedItems = items.filter(item => selectedIds.has(item.id));

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIds.has(item.id)
    );

    return (
        <div className='space-y-2'>
            <Popover>
                <PopoverTrigger asChild>
                    <div className='relative'>
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandList>
                            <CommandEmpty>No se encontraron items.</CommandEmpty>
                            {filteredItems.slice(0, 50).map(item => (
                                <CommandItem key={item.id} onSelect={() => { onToggle(item.id); setSearchTerm(''); }}>
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
             <div className="space-y-2 rounded-md border p-2 h-32 overflow-y-auto">
                 {selectedItems.length > 0 ? (
                    selectedItems.map(item => (
                        <Badge key={item.id} variant="secondary" className='mr-1 mb-1'>
                            {item.name}
                            <button type="button" onClick={() => onToggle(item.id)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))
                 ) : (
                    <p className='text-sm text-muted-foreground text-center py-4'>No hay items seleccionados.</p>
                 )}
            </div>
        </div>
    );
}
