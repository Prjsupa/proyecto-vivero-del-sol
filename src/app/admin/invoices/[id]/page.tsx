
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Invoice, Client } from "@/lib/definitions";
import { InvoiceView, PrintButton } from "../_components/invoice-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getInvoiceAndClient(invoiceId: string): Promise<{ invoice: Invoice, client: Client | null }> {
    const supabase = createClient();
    
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
    
    if (invoiceError || !invoice) {
        notFound();
    }
    
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', invoice.client_id)
        .single();

    if (clientError) {
        console.error('Error fetching client for invoice:', clientError);
    }
    
    return { invoice, client: client || null };
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    const { invoice, client } = await getInvoiceAndClient(params.id);

    return (
        <div className="bg-muted/40 min-h-screen print:bg-white" id="invoice-page">
            <div className="container mx-auto p-4 sm:p-8">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <Button asChild variant="outline">
                        <Link href="/admin/invoicing">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Facturas
                        </Link>
                    </Button>
                     <PrintButton />
                </div>

                <InvoiceView invoice={invoice} client={client} />
            </div>
        </div>
    );
}
