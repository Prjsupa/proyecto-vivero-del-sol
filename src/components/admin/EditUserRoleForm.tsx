
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { updateUserRole } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/lib/definitions';

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

export function EditUserRoleForm({ userProfile }: { userProfile: Profile }) {
    const [state, formAction] = useActionState(updateUserRole, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    // Define roles directly in the component
    const roles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Empleado' },
        { id: 3, name: 'Cliente' },
    ];
    
    const currentUserRole = roles.find(r => r.id === userProfile.rol)?.name || 'Desconocido';

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <button className="w-full text-left">Cambiar Rol</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Cambiar Rol de Usuario</DialogTitle>
                    <DialogDescription>
                        Selecciona el nuevo rol para {userProfile.name} {userProfile.last_name}.
                        <br />
                        <span className='font-semibold'>Rol actual: {currentUserRole}</span>
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="grid gap-4 py-4">
                    <input type="hidden" name="userId" value={userProfile.id} />
                    <div className="space-y-2">
                        <Label htmlFor="rol">Nuevo Rol</Label>
                        <Select name="rol" defaultValue={userProfile.rol.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(rol => (
                                    <SelectItem key={rol.id} value={rol.id.toString()}>{rol.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError errors={state.errors?.rol} />
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
