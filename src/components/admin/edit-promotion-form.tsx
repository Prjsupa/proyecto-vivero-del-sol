
'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Calendar as CalendarIcon, PlusCircle, Trash2, Search, X, ChevronsUpDown } from 'lucide-react';
import { updatePromotion } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Promotion, Product, Service } from '@/lib/definitions';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import { createClient } from '@/lib/supabase/client';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>) : 'Guardar Cambios'}
    </Button>
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
      <div className="rounded-md border p-2 h-32 overflow-y-auto">
        <div className="space-y-1">
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
    </div>
  );
}

export function EditPromotionForm({ promotion, setOpen }: { promotion: Promotion, setOpen: (open: boolean) => void }) {
  const [state, formAction] = useActionState(updatePromotion, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Mapear valores iniciales
  const [name, setName] = useState<string>(promotion.name);
  const [isActive, setIsActive] = useState<boolean>(promotion.is_active);
  const [canBeCombined, setCanBeCombined] = useState<boolean>(promotion.can_be_combined);
  const [usageLimitType, setUsageLimitType] = useState<'unlimited' | 'period'>(promotion.usage_limit_type);
  const [customTag, setCustomTag] = useState<string>(promotion.custom_tag || '');
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (promotion.usage_limit_type !== 'period') return undefined;
    const from = promotion.start_date && isValid(parseISO(promotion.start_date)) ? parseISO(promotion.start_date) : undefined;
    const to = promotion.end_date && isValid(parseISO(promotion.end_date)) ? parseISO(promotion.end_date) : undefined;
    if (!from && !to) return undefined;
    return { from, to } as DateRange;
  });

  // Campos requeridos por schema que no editamos ahora, los enviamos ocultos
  const [discountType, setDiscountType] = useState<Promotion["discount_type"]>(promotion.discount_type);
  const [applyToType, setApplyToType] = useState<Promotion["apply_to_type"]>(promotion.apply_to_type);
  const [selectedApplyToIds, setSelectedApplyToIds] = useState<Set<string>>(new Set((promotion.apply_to_ids ?? []) as string[]));

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [productSubcategories, setProductSubcategories] = useState<string[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);

  // Valores de descuento
  const { xForYTake, xForYPay, initialTiers } = useMemo(() => {
    if (discountType === 'x_for_y') {
      const take = (promotion.discount_value as any)?.take ?? '';
      const pay = (promotion.discount_value as any)?.pay ?? '';
      return { xForYTake: String(take), xForYPay: String(pay), initialTiers: [] as { quantity: string; percentage: string }[] };
    }
    if (discountType === 'progressive_discount') {
      const tiers = (promotion.discount_value as any)?.tiers ?? [];
      const mapped = Array.isArray(tiers)
        ? tiers.map((t: any) => ({ quantity: String(t.quantity ?? ''), percentage: String(t.percentage ?? '') }))
        : [];
      return { xForYTake: '', xForYPay: '', initialTiers: mapped };
    }
    return { xForYTake: '', xForYPay: '', initialTiers: [] as { quantity: string; percentage: string }[] };
  }, [discountType, promotion.discount_value]);

  const [progressiveTiers, setProgressiveTiers] = useState<{ quantity: string; percentage: string }[]>(
    discountType === 'progressive_discount' && initialTiers.length > 0
      ? initialTiers
      : [{ quantity: '', percentage: '' }]
  );

  const addTier = () => setProgressiveTiers((prev) => [...prev, { quantity: '', percentage: '' }]);
  const removeTier = (index: number) => setProgressiveTiers((prev) => prev.filter((_, i) => i !== index));
  const handleTierChange = (index: number, field: 'quantity' | 'percentage', value: string) => {
    setProgressiveTiers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value } as any;
      return next;
    });
  };

  // Load data for selectors
  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const [prodRes, servRes] = await Promise.all([
        supabase.from('products').select('id,name,category,subcategory'),
        supabase.from('services').select('id,name,category')
      ]);
      const prods = (prodRes.data as any[])?.map(p => ({ id: String(p.id), name: p.name, category: p.category, subcategory: p.subcategory })) ?? [];
      const servs = (servRes.data as any[])?.map(s => ({ id: String(s.id), name: s.name, category: s.category, precio_venta: 0, available: true })) ?? [] as Service[];
      setProducts(prods as Product[]);
      setServices(servs as Service[]);
      setProductCategories(Array.from(new Set(prods.map(p => p.category).filter(Boolean))));
      setProductSubcategories(Array.from(new Set(prods.map(p => p.subcategory).filter(Boolean))));
      setServiceCategories(Array.from(new Set(servs.map(s => s.category).filter(Boolean))));
    };
    load();
  }, []);

  const handleApplyToTypeChange = (value: Promotion["apply_to_type"]) => {
    setApplyToType(value);
    setSelectedApplyToIds(new Set());
  };

  const handleMultiSelectToggle = (id: string) => {
    setSelectedApplyToIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!state) return;
    if (state.message === 'success') {
      toast({ title: '¡Éxito!', description: state.data });
      setOpen(false);
    } else if (state.message) {
      toast({ title: 'Error', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, setOpen]);

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Editar Promoción</DialogTitle>
        <DialogDescription>Modifica los datos de la promoción. Por ahora puedes editar campos generales; el resto se conserva.</DialogDescription>
      </DialogHeader>
      <form action={formAction} ref={formRef} className="flex-grow overflow-hidden flex flex-col gap-4">
        {/* Hidden required fields */}
        <input type="hidden" name="id" value={promotion.id} />
        <input type="hidden" name="discount_type" value={discountType} />
        <input type="hidden" name="apply_to_type" value={applyToType} />
        <input type="hidden" name="apply_to_ids" value={Array.from(selectedApplyToIds).join(',')} />
        <input type="hidden" name="x_for_y_take" value={xForYTake} />
        <input type="hidden" name="x_for_y_pay" value={xForYPay} />
        <input
          type="hidden"
          name="progressive_tiers"
          value={discountType === 'progressive_discount'
            ? JSON.stringify(progressiveTiers.filter(t => t.quantity !== '' && t.percentage !== ''))
            : '[]'}
        />

        <div className="space-y-4 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Promoción</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is_active">Activa</Label>
          </div>
          <input type="hidden" name="is_active" value={isActive ? 'true' : 'false'} />

          <div className="flex items-center space-x-2">
            <Checkbox id="can_be_combined" checked={canBeCombined} onCheckedChange={(v) => setCanBeCombined(!!v)} />
            <Label htmlFor="can_be_combined">Permitir combinar con otras promociones</Label>
          </div>
          <input type="hidden" name="can_be_combined" value={canBeCombined ? 'true' : 'false'} />

          <div className="space-y-2">
            <Label>Límites de uso</Label>
            <div className="flex gap-2">
              <Button type="button" variant={usageLimitType === 'unlimited' ? 'default' : 'outline'} onClick={() => setUsageLimitType('unlimited')}>Ilimitada</Button>
              <Button type="button" variant={usageLimitType === 'period' ? 'default' : 'outline'} onClick={() => setUsageLimitType('period')}>Período</Button>
            </div>
            <input type="hidden" name="usage_limit_type" value={usageLimitType} />
            {usageLimitType === 'period' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-[300px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (<>{format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}</>) : (format(date.from, 'LLL dd, y'))
                    ) : (<span>Selecciona un rango</span>)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            )}
            <input type="hidden" name="start_date" value={date?.from?.toISOString() ?? ''} />
            <input type="hidden" name="end_date" value={date?.to?.toISOString() ?? ''} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_tag">Etiqueta personalizada (Opcional)</Label>
            <Input id="custom_tag" name="custom_tag" value={customTag} onChange={(e) => setCustomTag(e.target.value)} />
          </div>

          {/* Discount Type */}
          <div className="space-y-2">
            <Label htmlFor="discount_type">Tipo de descuento</Label>
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as Promotion["discount_type"])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x_for_y">Llevá X y pagá Y (2x1, 3x2, etc.)</SelectItem>
                <SelectItem value="progressive_discount">Descuento progresivo por cantidad</SelectItem>
                <SelectItem value="price_discount" disabled>Descuento sobre precios</SelectItem>
                <SelectItem value="cross_selling" disabled>Cross selling</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="discount_type" value={discountType} />
          </div>

          {discountType === 'x_for_y' && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="x_for_y_take">Llevando</Label>
                <Input id="x_for_y_take" name="x_for_y_take" type="number" min="1" defaultValue={xForYTake} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="x_for_y_pay">Pagás</Label>
                <Input id="x_for_y_pay" name="x_for_y_pay" type="number" min="1" defaultValue={xForYPay} />
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
                    <Input
                      id={`tier-percentage-${index}`}
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                      value={tier.percentage}
                      onChange={(e) => handleTierChange(index, 'percentage', e.target.value)}
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-200 border border-l-0 border-input rounded-r-md px-3 py-2 text-sm text-muted-foreground">%</div>
                  </div>

                  <div className="flex items-center w-full">
                    <Input
                      id={`tier-quantity-${index}`}
                      type="number"
                      min="1"
                      placeholder="2"
                      value={tier.quantity}
                      onChange={(e) => handleTierChange(index, 'quantity', e.target.value)}
                      className="rounded-r-none"
                    />
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

          {/* Apply To */}
          <div className="space-y-2">
            <Label htmlFor="apply_to_type">Aplicar a</Label>
            <Select value={applyToType} onValueChange={(v) => handleApplyToTypeChange(v as Promotion["apply_to_type"]) }>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona dónde aplicar" />
              </SelectTrigger>
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

        <DialogFooter className="mt-2 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <SubmitButton />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
