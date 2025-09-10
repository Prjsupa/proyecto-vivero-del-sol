
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Invoice, Profile } from "@/lib/definitions";
import { InvoicesTable } from "@/components/admin/invoices-table";
import { ExportInvoicesButton } from "@/components/admin/export-invoices-button";

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

async function getCustomers(): Promise<Profile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('rol', 3)
        .order('last_name', { ascending: true });
    
    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    return data;
}


export default async function InvoicingPage() {
    const invoices = await getInvoices();
    const customers = await getCustomers();

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Facturas</h1>
                    <p className="text-muted-foreground">Visualiza, filtra y exporta todas las facturas emitidas.</p>
                </div>
                 <div className="flex items-center gap-2">
                     <ExportInvoicesButton invoices={invoices} />
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Listado de Facturas</CardTitle>
                    <CardDescription>Aquí aparecerá la lista de facturas con sus filtros correspondientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InvoicesTable invoices={invoices} customers={customers} />
                </CardContent>
            </Card>
        </div>
    )
}
