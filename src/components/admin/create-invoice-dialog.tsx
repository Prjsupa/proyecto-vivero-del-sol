
'use client';

import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { Client, Product } from "@/lib/definitions";
import { CreateInvoiceForm } from "./create-invoice-form";

interface CreateInvoiceDialogProps {
    children: React.ReactNode;
    customers: Client[];
    products: Product[];
    selectedCustomerId?: string;
}

export function CreateInvoiceDialog({ children, customers, products, selectedCustomerId }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <CreateInvoiceForm 
                customers={customers} 
                products={products} 
                selectedCustomerId={selectedCustomerId}
                setOpen={setOpen}
            />
        </Dialog>
    )
}
