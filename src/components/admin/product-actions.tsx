
'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { EditProductForm } from "./edit-product-form";
import type { Product } from "@/lib/definitions";

export function ProductActions({ product }: { product: Product }) {
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
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EditProductForm product={product} />
                </DropdownMenuItem>
                <DropdownMenuItem>Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
