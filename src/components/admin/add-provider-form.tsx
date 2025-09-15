

'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2 } from 'lucide-react';
import { addProvider } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { ProviderType } from '@/lib/definitions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear Proveedor'}
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

export function AddProviderForm({ providerTypes }: { providerTypes: ProviderType[] }) {
    const [state, formAction] = useActionState(addProvider, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedProviderType, setSelectedProviderType] = useState<string>('');
    const [isAddingNew, setIsAddingNew] = useState(false);

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            resetForm();
        } else if (state?.message && state.message !== 'success' && state.message !== '') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);
    
    const resetForm = () => {
        setIsDialogOpen(false);
        formRef.current?.reset();
        setSelectedProviderType('');
        setIsAddingNew(false);
    }

    const onDialogChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsDialogOpen(open);
    }
    
    const handleTypeChange = (value: string) => {
        if (value === 'add_new') {
            setIsAddingNew(true);
            setSelectedProviderType('');
        } else {
            setIsAddingNew(false);
            setSelectedProviderType(value);
        }
    };


    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Nuevo Proveedor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Proveedor</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del nuevo proveedor.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Proveedor</Label>
                        <Input id="name" name="name" />
                        <FieldError errors={state.errors?.name} />
                         {state.message && state.message !== 'success' && !state.errors && (
                            <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {state.message}
                            </p>
                         )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="provider_type_code">Tipo de Proveedor</Label>
                         <Select onValueChange={handleTypeChange} value={isAddingNew ? 'add_new' : selectedProviderType}>
                            <SelectTrigger id="provider-type-select">
                                <SelectValue placeholder="Selecciona o crea un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {providerTypes.map(type => (
                                    <SelectItem key={type.code} value={type.code}>{type.code} - {type.description}</SelectItem>
                                ))}
                                <SelectItem value="add_new">Crear nuevo tipo</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="provider_type_code" value={selectedProviderType} />
                        {isAddingNew && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="new_provider_type_code">Nuevo Código</Label>
                                    <Input id="new_provider_type_code" name="new_provider_type_code" placeholder="Ej: NAC" />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label htmlFor="new_provider_type_description">Nueva Descripción</Label>
                                    <Input id="new_provider_type_description" name="new_provider_type_description" placeholder="Ej: Nacional" />
                                </div>
                            </div>
                        )}
                        <FieldError errors={state.errors?.provider_type_code} />
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
