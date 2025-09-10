
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { EditServiceForm } from "./edit-service-form";
import type { Service } from "@/lib/definitions";
import { DeleteServiceAlert } from "./delete-service-alert";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export function ServiceActions({ service, categories }: { service: Service, categories: string[] }) {
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
                <EditServiceForm service={service} categories={categories} setDialogOpen={setIsEditOpen} />
                <DeleteServiceAlert serviceId={service.id} serviceName={service.name} />
             </AlertDialog>
        </Dialog>
    );
}
