
import { createClient } from "@/lib/supabase/server";
import type { Invoice, Client } from "@/lib/definitions";
import { CurrentAccountsView } from "@/components/admin/current-accounts-view";
import { cookies } from "next/headers";

async function getInvoices(): Promise<Invoice[]> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
    return data;
}

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


export default async function CurrentAccountsPage() {
    const invoices = await getInvoices();
    const clients = await getClients();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-2xl font-semibold">Cuentas Corrientes</h1>
                    <p className="text-muted-foreground">Gestiona los saldos y movimientos de las cuentas corrientes de tus clientes.</p>
                </div>
            </div>
            <CurrentAccountsView invoices={invoices} customers={clients} />
        </div>
    )
}
