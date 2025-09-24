'use client';
import { useState, useEffect } from 'react';
import type { UnitOfVolume } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Beaker, Trash, Edit, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { deleteUnitOfVolume, updateUnitOfVolume } from '@/lib/aux-actions';
import { useActionState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';

function EditUnitForm({ unit, onActionCompleted }: { unit: UnitOfVolume, onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateUnitOfVolume, { message: '' });
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
                    <DialogTitle>Editar Unidad de Volumen</DialogTitle>
                    <DialogDescription>Actualiza el código y la descripción.</DialogDescription>
                </DialogHeader>
                 <form action={formAction} className="grid gap-4 py-4">
                     <input type="hidden" name="old_code" value={unit.code} />
                    <div className="space-y-2">
                        <Label htmlFor="code">Código</Label>
                        <Input id="code" name="code" defaultValue={unit.code} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" name="description" defaultValue={unit.description} />
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

function DeleteUnitAlert({ unit, onActionCompleted }: { unit: UnitOfVolume, onActionCompleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteUnitOfVolume(unit.code);
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
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la unidad de volumen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                     <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Eliminar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function UnitOfVolumeManager({ allUnits, onActionCompleted }: { allUnits: UnitOfVolume[], onActionCompleted: () => void }) {
    return (
        <Card>
             <CardHeader>
                <p className="text-sm text-muted-foreground">Gestiona las unidades de volumen del sistema.</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUnits.length > 0 ? (
                            allUnits.map((unit) => (
                                <TableRow key={unit.code}>
                                    <TableCell className="font-medium">{unit.code}</TableCell>
                                    <TableCell>{unit.description}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditUnitForm unit={unit} onActionCompleted={onActionCompleted} />
                                            <DeleteUnitAlert unit={unit} onActionCompleted={onActionCompleted} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Beaker className="h-12 w-12" />
                                        <p className="font-semibold">No se encontraron unidades de volumen.</p>
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
