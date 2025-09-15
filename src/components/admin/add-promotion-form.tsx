
'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, PlusCircle, Loader2 } from 'lucide-react';
import { addPromotion } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import type { Product, Service } from '@/lib/definitions';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"


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
    serviceCategories: string[];
}

export function AddPromotionForm({ products, services, productCategories, serviceCategories }: AddPromotionFormProps) {
    const [state, formAction] = useActionState(addPromotion, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    const [discountType, setDiscountType] = useState<string>('');
    const [applyToType, setApplyToType] = useState<string>('');
    const [usageLimitType, setUsageLimitType] = useState<string>('unlimited');
    const [date, setDate] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined });


    useEffect(() => {
        if (state?.message === 'success') {
            toast({ title: '¡Éxito!', description: state.data });
            setIsDialogOpen(false);
            resetFormState();
        } else if (state?.message && state.message !== 'success') {
             toast({ title: 'Error', description: state.message, variant: 'destructive' });
        }
    }, [state, toast]);

    const resetFormState = () => {
        formRef.current?.reset();
        setDiscountType('');
        setApplyToType('');
        setUsageLimitType('unlimited');
        setDate({ from: undefined, to: undefined });
    };

    const onDialogChange = (open: boolean) => {
        if (!open) resetFormState();
        setIsDialogOpen(open);
    }
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Promoción
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Promoción</DialogTitle>
                    <DialogDescription>
                        Completa los detalles para configurar una nueva promoción.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4 overflow-y-auto pr-4">
                     <input type="hidden" name="start_date" value={date.from?.toISOString()} />
                     <input type="hidden" name="end_date" value={date.to?.toISOString()} />
                    
                    {/* General Info */}
                    <div className="space-y-4 border-b pb-4">
                         <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Promoción</Label>
                            <Input id="name" name="name" placeholder="Ej: Promo Día de la Madre"/>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="x_for_y">Llevá X y pagá Y (2x1, 3x2, etc.)</SelectItem>
                                    <SelectItem value="price_discount" disabled>Descuento sobre precios</SelectItem>
                                    <SelectItem value="cross_selling" disabled>Cross selling</SelectItem>
                                    <SelectItem value="progressive_discount" disabled>Descuento progresivo por cantidad</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {discountType === 'x_for_y' && (
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                                <div className="space-y-2">
                                    <Label htmlFor="x_for_y_take">Llevando</Label>
                                    <Input id="x_for_y_take" name="x_for_y_take" type="number" placeholder="Ej: 3" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="x_for_y_pay">Pagás</Label>
                                    <Input id="x_for_y_pay" name="x_for_y_pay" type="number" placeholder="Ej: 2" />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Apply To */}
                     <div className="space-y-4 border-b pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="apply_to_type">Aplicar a</Label>
                            <Select name="apply_to_type" onValueChange={setApplyToType}>
                                <SelectTrigger><SelectValue placeholder="Selecciona dónde aplicar" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toda la tienda</SelectItem>
                                    <SelectItem value="categories">Categorías específicas</SelectItem>
                                    <SelectItem value="products">Productos específicos</SelectItem>
                                    <SelectItem value="services">Servicios específicos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                                    className={cn("w-[300px] justify-start text-left font-normal", !date.from && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date.from ? (
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
                        <Input id="custom_tag" name="custom_tag" placeholder="Ej: ¡OFERTA!" />
                        <p className="text-xs text-muted-foreground">Esta etiqueta aparecerá en los productos/servicios en promoción.</p>
                    </div>

                     <DialogFooter className="mt-4">
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
