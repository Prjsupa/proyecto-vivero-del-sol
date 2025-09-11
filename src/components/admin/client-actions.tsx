
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Client, Product } from "@/lib/definitions";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import Link from "next/link";
import { CreateInvoiceForm } from "./create-invoice-form";
import { EditClientForm } from "./edit-client-form";

export function ClientActions({ client, allClients, allProducts }: { client: Client, allClients: Client[], allProducts: Product[] }) {
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    return (
        <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
             <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
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
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditOpen(true); }}>
                               Editar
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuSeparator />
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsCreateInvoiceOpen(true);}}>
                                Crear Factura
                            </DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Dialog Content is rendered outside the trigger */}
                {isCreateInvoiceOpen && <CreateInvoiceForm customers={allClients} products={allProducts} selectedCustomerId={String(client.id)} />}
                {isEditOpen && <EditClientForm client={client} setDialogOpen={setIsEditOpen} />}
             </Dialog>
        </Dialog>
    );
}
