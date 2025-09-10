
import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/lib/definitions";
import { ExportInvoicesButton } from "@/components/admin/export-invoices-button";
import { CurrentAccountsView } from "@/components/admin/current-accounts-view";

async function getInvoices(): Promise<Invoice[]> {
    const supabase = createClient();
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


export default async function CurrentAccountsPage() {
    const invoices = await getInvoices();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-2xl font-semibold">Cuentas Corrientes</h1>
                    <p className="text-muted-foreground">Gestiona los saldos y movimientos de las cuentas corrientes de tus clientes.</p>
                </div>
                 <div className="flex items-center gap-2">
                     <ExportInvoicesButton invoices={invoices} />
                </div>
            </div>
            <CurrentAccountsView invoices={invoices} />
        </div>
    )
}
