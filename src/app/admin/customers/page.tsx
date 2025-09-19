
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client, Product } from "@/lib/definitions";
import { CustomersTable } from "@/components/admin/customers-table";
import { AddClientForm } from "@/components/admin/add-client-form";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoiceDialog } from "@/components/admin/create-invoice-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { cookies } from "next/headers";

async function getClients(): Promise<Client[]> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_name', { ascending: true });
    
    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }
    return data;
}

async function getProducts(): Promise<Product[]> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data;
}


export default async function CustomersPage() {
    const clients = await getClients();
    const products = await getProducts();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona los clientes para la facturación.</p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateInvoiceDialog customers={clients} products={products}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nueva Factura
                        </Button>
                    </CreateInvoiceDialog>
                    <AddClientForm />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>Aquí aparecerán tus clientes registrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomersTable customers={clients} products={products} />
                </CardContent>
            </Card>
        </div>
    )
}
