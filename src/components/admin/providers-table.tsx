
'use client';

import type { Provider } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from 'date-fns';
import { Building2, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger } from "../ui/alert-dialog";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { DeleteProviderAlert } from "./delete-provider-alert";
import { EditProviderForm } from "./edit-provider-form";

function ProviderActions({ provider }: { provider: Provider }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    
    return (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
             <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                               Editar
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuSeparator />
                         <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                Eliminar
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <EditProviderForm provider={provider} setDialogOpen={setIsEditOpen} />
                <DeleteProviderAlert providerId={provider.id} providerName={provider.name} />
             </AlertDialog>
        </Dialog>
    );
}

export function ProvidersTable({ providers }: { providers: Provider[] }) {

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">Fecha de registro</TableHead>
                    <TableHead>
                        <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <TableRow key={provider.id}>
                            <TableCell className="font-medium">{provider.name}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                                {format(parseISO(provider.created_at), 'dd MMM, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                                 <ProviderActions provider={provider} />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Building2 className="h-12 w-12" />
                                <p className="font-semibold">No se encontraron proveedores.</p>
                                <p className="text-sm">Puedes agregar un nuevo proveedor para empezar.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
