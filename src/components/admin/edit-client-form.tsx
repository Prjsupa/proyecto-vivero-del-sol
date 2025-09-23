'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { updateClient } from '@/lib/client-actions';
import { useToast } from '@/hooks/use-toast';
import type { Client } from '@/lib/definitions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

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

const provinces = [
    "Buenos Aires",
    "Ciudad Autónoma de Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
    "Tucumán"
];


export function EditClientForm({ client, setOpen }: { client: Client, setOpen: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updateClient, undefined);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [birthDate, setBirthDate] = useState<Date | undefined>(
        client.birth_date && isValid(parseISO(client.birth_date)) ? parseISO(client.birth_date) : undefined
    );
    const [activeTab, setActiveTab] = useState('personal');
    const [docType, setDocType] = useState<string>(client.document_type || '');

    useEffect(() => {
        if (!state) return;
        if (state.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setOpen(false);
        } else if (state.message) {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, setOpen]);

    return (
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline">Editar Cliente</DialogTitle>
                <DialogDescription>
                    Modifica los detalles del cliente.
                </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="flex-grow overflow-hidden">
                <input type="hidden" name="id" value={client.id} />
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="personal">Datos Personales</TabsTrigger>
                        <TabsTrigger value="fiscal">Datos Fiscales</TabsTrigger>
                        <TabsTrigger value="contact">Contacto y Dirección</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow overflow-y-auto p-1 pt-4 space-y-4">
                        <TabsContent value="personal" forceMount className={cn("space-y-4", activeTab !== 'personal' && 'hidden')}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" name="name" defaultValue={client.name} />
                                    <FieldError errors={state?.errors?.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Apellido</Label>
                                    <Input id="last_name" name="last_name" defaultValue={client.last_name} />
                                    <FieldError errors={state?.errors?.last_name} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="razon_social">Razón Social (Opcional)</Label>
                                <Input id="razon_social" name="razon_social" defaultValue={client.razon_social || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nombre_fantasia">Nombre Comercial / Fantasía (Opcional)</Label>
                                <Input id="nombre_fantasia" name="nombre_fantasia" defaultValue={client.nombre_fantasia || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {birthDate ? format(birthDate, "PPP") : <span>Selecciona una fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={birthDate}
                                        onSelect={setBirthDate}
                                        initialFocus
                                        captionLayout="dropdown-buttons"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <input type="hidden" name="birth_date" value={birthDate?.toISOString()} />
                            </div>
                        </TabsContent>
                        <TabsContent value="fiscal" forceMount className={cn("space-y-4", activeTab !== 'fiscal' && 'hidden')}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="document_type">Tipo de Documento</Label>
                                    <Select name="document_type" value={docType} onValueChange={setDocType}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="CUIT">CUIT</SelectItem>
                                            <SelectItem value="CUIL">CUIL</SelectItem>
                                            <SelectItem value="NN">NN (Sin especificar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="document_number">Nº de Documento</Label>
                                    <Input id="document_number" name="document_number" defaultValue={client.document_number || ''} disabled={docType === 'NN'} />
                                    <FieldError errors={state?.errors?.document_number} />
                                    {state?.message && state.message.includes('documento') && !state.errors && (
                                        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                            <AlertCircle size={14} /> {state.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="iva_condition">Condición frente al IVA</Label>
                                <Select name="iva_condition" defaultValue={client.iva_condition || ''}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                                        <SelectItem value="Exento">Exento</SelectItem>
                                        <SelectItem value="Monotributo">Monotributo</SelectItem>
                                        <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="default_invoice_type">Tipo de Factura por Defecto</Label>
                                <Select name="default_invoice_type" defaultValue={client.default_invoice_type || ''}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Factura A</SelectItem>
                                        <SelectItem value="B">Factura B</SelectItem>
                                        <SelectItem value="C">Factura C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price_list">Listado de Precios (Opcional)</Label>
                                    <Input id="price_list" name="price_list" defaultValue={client.price_list || ''} />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="contact" forceMount className={cn("space-y-4", activeTab !== 'contact' && 'hidden')}>
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" name="address" defaultValue={client.address || ''} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Localidad</Label>
                                    <Input id="city" name="city" defaultValue={client.city || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="province">Provincia</Label>
                                    <Select name="province" defaultValue={client.province || ''}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar provincia..." /></SelectTrigger>
                                        <SelectContent>
                                            {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Código Postal</Label>
                                    <Input id="postal_code" name="postal_code" defaultValue={client.postal_code || ''} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" name="phone" type="tel" defaultValue={client.phone || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile_phone">Celular</Label>
                                    <Input id="mobile_phone" name="mobile_phone" type="tel" defaultValue={client.mobile_phone || ''} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={client.email || ''} />
                                <FieldError errors={state?.errors?.email} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
                <DialogFooter className="mt-4 pt-4 border-t shrink-0">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
