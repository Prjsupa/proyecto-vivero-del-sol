
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Client, Product } from "@/lib/definitions";
import Link from "next/link";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { EditClientDialog } from "./edit-client-dialog";


export function ClientActions({ client, allClients, allProducts }: { client: Client, allClients: Client[], allProducts: Product[] }) {
    
    return (
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
                
                <CreateInvoiceDialog customers={allClients} products={allProducts} selectedCustomerId={String(client.id)}>
                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Crear Factura
                    </DropdownMenuItem>
                </CreateInvoiceDialog>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}
