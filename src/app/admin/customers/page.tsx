
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client, Product, Service, CashAccount, Seller } from "@/lib/definitions";
import { CustomersTable } from "@/components/admin/customers-table";
import { AddClientForm } from "@/components/admin/add-client-form";
import { createClient } from "@/lib/supabase/server";
import { CreateInvoiceDialog } from "@/components/admin/create-invoice-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { cookies } from "next/headers";

async function getData() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const [clientsData, productsData, servicesData, cashAccountsData, sellersData] = await Promise.all([
        supabase.from('clients').select('*').order('last_name', { ascending: true }),
        supabase.from('products').select('*').order('name', { ascending: true }),
        supabase.from('services').select('*').order('name', { ascending: true }),
        supabase.from('cash_accounts').select('*').order('description', { ascending: true }),
        supabase.from('sellers').select('*').order('last_name', { ascending: true })
    ]);

    if (clientsData.error) console.error('Error fetching clients:', clientsData.error);
    if (productsData.error) console.error('Error fetching products:', productsData.error);
    if (servicesData.error) console.error('Error fetching services:', servicesData.error);
    if (cashAccountsData.error) console.error('Error fetching cash accounts:', cashAccountsData.error);
    if (sellersData.error) console.error('Error fetching sellers:', sellersData.error);

    return {
        clients: (clientsData.data as Client[]) || [],
        products: (productsData.data as Product[]) || [],
        services: (servicesData.data as Service[]) || [],
        cashAccounts: (cashAccountsData.data as CashAccount[]) || [],
        sellers: (sellersData.data as Seller[]) || [],
    };
}


export default async function CustomersPage() {
    const { clients, products, services, cashAccounts, sellers } = await getData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona los clientes para la facturación.</p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateInvoiceDialog customers={clients} products={products} services={services} cashAccounts={cashAccounts} sellers={sellers}>
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
                    <CustomersTable customers={clients} products={products} services={services} cashAccounts={cashAccounts} sellers={sellers} />
                </CardContent>
            </Card>
        </div>
    )
}
