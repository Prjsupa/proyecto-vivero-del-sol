'use client';
import { useState, useMemo, useEffect } from 'react';
import type { Provider, ProviderType } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Trash, Edit, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { deleteProviderType, updateProviderType } from '@/lib/actions';
import { useActionState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';

function EditProviderTypeForm({ providerType, onActionCompleted }: { providerType: ProviderType, onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateProviderType, { message: '' });
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (state?.message === 'success') {
            toast({ title: "¡Éxito!", description: state.data });
            setIsDialogOpen(false);
            onActionCompleted();
        } else if (state?.message && state.message !== 'success') {
            toast({ title: 'Error', description: state.message, variant: 'destructive' });
        }
    }, [state, toast, onActionCompleted]);
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Tipo de Proveedor</DialogTitle>
                    <DialogDescription>Actualiza el código y la descripción.</DialogDescription>
                </DialogHeader>
                 <form action={formAction} className="grid gap-4 py-4">
                     <input type="hidden" name="old_code" value={providerType.code} />
                    <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input id="code" name="code" defaultValue={providerType.code} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" defaultValue={providerType.description} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit">Guardar Cambios</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteProviderTypeAlert({ providerType, providerCount, onActionCompleted }: { providerType: ProviderType, providerCount: number, onActionCompleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteProviderType(providerType.code);
        setIsLoading(false);
        if (result.message === 'success') {
            toast({ title: '¡Éxito!', description: result.data });
            onActionCompleted();
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {providerCount > 0 ? (
                            `No puedes eliminar este tipo porque está asignado a ${providerCount} proveedor(es).`
                        ) : (
                            "Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de proveedor."
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                     <AlertDialogAction onClick={handleDelete} disabled={isLoading || providerCount > 0} className="bg-destructive hover:bg-destructive/90">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function ProviderTypeManager({ allProviders, allProviderTypes, onActionCompleted }: { allProviders: Provider[], allProviderTypes: ProviderType[], onActionCompleted: () => void }) {

    const providerCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const type of allProviderTypes) {
            counts[type.code] = allProviders.filter(p => p.provider_type_code === type.code).length;
        }
        return counts;
    }, [allProviders, allProviderTypes]);

    return (
        <Card>
             <CardHeader>
                <p className="text-sm text-muted-foreground">Gestiona los tipos de proveedores del sistema.</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Proveedores Asociados</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allProviderTypes.length > 0 ? (
                            allProviderTypes.map((type) => (
                                <TableRow key={type.code}>
                                    <TableCell className="font-medium">{type.code}</TableCell>
                                    <TableCell>{type.description}</TableCell>
                                    <TableCell>{providerCounts[type.code] || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditProviderTypeForm providerType={type} onActionCompleted={onActionCompleted} />
                                            <DeleteProviderTypeAlert providerType={type} providerCount={providerCounts[type.code] || 0} onActionCompleted={onActionCompleted} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Building className="h-12 w-12" />
                                        <p className="font-semibold">No se encontraron tipos de proveedor.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
