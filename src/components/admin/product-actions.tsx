
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { EditProductForm } from "./edit-product-form";
import type { Product } from "@/lib/definitions";
import { DeleteProductAlert } from "./delete-product-alert";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export function ProductActions({ product, categories }: { product: Product, categories: string[] }) {
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
                <EditProductForm product={product} categories={categories} setDialogOpen={setIsEditOpen} />
                <DeleteProductAlert productId={product.id} productName={product.name} />
             </AlertDialog>
        </Dialog>
    );
}
