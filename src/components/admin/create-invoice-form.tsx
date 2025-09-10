'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Receipt } from 'lucide-react';
import { createInvoice } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import type { Profile } from '@/lib/definitions';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
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
    selectedCustomerId?: string;
    triggerMode?: 'button' | 'menuitem';
}


export function CreateInvoiceForm({ customers, selectedCustomerId, triggerMode = 'button' }: CreateInvoiceFormProps) {
    const [state, formAction] = useActionState(createInvoice, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
            formRef.current?.reset();
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Factura</DialogTitle>
                    <DialogDescription>
                        Completa los detalles para generar una nueva factura.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
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
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Efectivo" id="pay-efectivo" />
                                    <Label htmlFor="pay-efectivo">Efectivo</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Transferencia" id="pay-transfer" />
                                    <Label htmlFor="pay-transfer">Transferencia</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Tarjeta" id="pay-tarjeta" />
                                    <Label htmlFor="pay-tarjeta">Tarjeta</Label>
                                </div>
                            </RadioGroup>
                        </div>

                         <div className="flex items-center space-x-2">
                            <Checkbox id="has_secondary_payment" name="has_secondary_payment" />
                            <Label htmlFor="has_secondary_payment" className="text-sm font-normal">
                                Se abonó con un método de pago secundario
                            </Label>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="notes">Notas Adicionales</Label>
                             <Textarea id="notes" name="notes" placeholder="Ej: Últimos 4 dígitos de la tarjeta, ID de transferencia, etc." />
                        </div>
                    </div>


                    {/* Placeholder for future fields */}
                    <div className="space-y-4 rounded-md border p-4 mt-4">
                        <p className="text-sm text-muted-foreground text-center">La selección de productos y el cálculo del total se añadirán aquí.</p>
                    </div>

                     <DialogFooter>
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
