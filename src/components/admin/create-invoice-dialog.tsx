'use client';

import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { Client, Product, Service, CashAccount, Seller } from "@/lib/definitions";
import { CreateInvoiceForm } from "./create-invoice-form";

interface CreateInvoiceDialogProps {
    children: React.ReactNode;
    customers: Client[];
    products: Product[];
    services: Service[];
    cashAccounts: CashAccount[];
    sellers: Seller[];
    selectedCustomerId?: string;
}

export function CreateInvoiceDialog({ children, customers, products, services, cashAccounts, sellers, selectedCustomerId }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <CreateInvoiceForm 
                customers={customers} 
                products={products} 
                services={services}
                cashAccounts={cashAccounts}
                sellers={sellers}
                selectedCustomerId={selectedCustomerId}
                setOpen={setOpen}
            />
        </Dialog>
    )
}
