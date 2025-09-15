'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateSeller } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Seller } from '@/lib/definitions';

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

export function EditSellerForm({ seller, setDialogOpen }: { seller: Seller, setDialogOpen: (open: boolean) => void }) {
    const [state, formAction] = useActionState(updateSeller, { message: '' });
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setDialogOpen(false);
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, setDialogOpen]);

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Editar Vendedor</DialogTitle>
                <DialogDescription>
                    Modifica los detalles del vendedor.
                </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                <input type="hidden" name="id" value={seller.id} />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" defaultValue={seller.name} />
                        <FieldError errors={state.errors?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Apellido</Label>
                        <Input id="last_name" name="last_name" defaultValue={seller.last_name} />
                        <FieldError errors={state.errors?.last_name} />
                    </div>
                </div>
                    <div className="space-y-2">
                    <Label htmlFor="address">Domicilio</Label>
                    <Input id="address" name="address" defaultValue={seller.address || ''} />
                    <FieldError errors={state.errors?.address} />
                </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dni">DNI</Label>
                        <Input id="dni" name="dni" defaultValue={seller.dni || ''} />
                        <FieldError errors={state.errors?.dni} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" name="phone" defaultValue={seller.phone || ''} />
                        <FieldError errors={state.errors?.phone} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="authorized_discount">Desc. Autorizado (%)</Label>
                    <Input id="authorized_discount" name="authorized_discount" type="number" step="0.01" defaultValue={seller.authorized_discount || ''} />
                    <FieldError errors={state.errors?.authorized_discount} />
                </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cash_sale_commission">Comisión Vta. Efectivo (%)</Label>
                        <Input id="cash_sale_commission" name="cash_sale_commission" type="number" step="0.01" defaultValue={seller.cash_sale_commission || ''} />
                        <FieldError errors={state.errors?.cash_sale_commission} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="collection_commission">Comisión Cobranza (%)</Label>
                        <Input id="collection_commission" name="collection_commission" type="number" step="0.01" defaultValue={seller.collection_commission || ''} />
                        <FieldError errors={state.errors?.collection_commission} />
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
