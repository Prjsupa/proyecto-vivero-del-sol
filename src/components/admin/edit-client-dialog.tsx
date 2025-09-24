
'use client';

import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { Client } from "@/lib/definitions";
import { EditClientForm } from "./edit-client-form";

interface EditClientDialogProps {
    children: React.ReactNode;
    client: Client;
}

export function EditClientDialog({ children, client }: EditClientDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <EditClientForm 
                client={client}
                setOpen={setOpen}
            />
        </Dialog>
    )
}
