'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Client, Product, Service, CashAccount, Seller } from "@/lib/definitions";
import Link from "next/link";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { EditClientDialog } from "./edit-client-dialog";
import { AlertDialog, AlertDialogTrigger } from "../ui/alert-dialog";
import { DeleteClientAlert } from "./delete-client-alert";
import { useState } from "react";


export function ClientActions({ client, allClients, allProducts, services, cashAccounts, sellers }: { client: Client, allClients: Client[], allProducts: Product[], services: Service[], cashAccounts: CashAccount[], sellers: Seller[] }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/customers/${client.id}`}>
                            Ver Detalles
                        </Link>
                    </DropdownMenuItem>
                    
                    <EditClientDialog client={client}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Editar
                        </DropdownMenuItem>
                    </EditClientDialog>

                    <DropdownMenuSeparator />
                    
                    <CreateInvoiceDialog customers={allClients} products={allProducts} services={services} cashAccounts={cashAccounts} sellers={sellers} selectedCustomerId={String(client.id)}>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Crear Factura
                        </DropdownMenuItem>
                    </CreateInvoiceDialog>

                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            Eliminar
                        </DropdownMenuItem>
                    </AlertDialogTrigger>

                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteClientAlert clientId={client.id} clientName={`${client.name} ${client.last_name}`} />
        </AlertDialog>
    );
}
