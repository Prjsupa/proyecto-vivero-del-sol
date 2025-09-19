
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Invoice, Client, CompanyData, CashAccount } from "@/lib/definitions";
import { InvoiceView, PrintButton } from "@/components/admin/invoices/_components/invoice-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";

async function getInvoiceAndClient(invoiceId: string): Promise<{ invoice: Invoice, client: Client | null }> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
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

async function getCompanyData(): Promise<CompanyData | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('company_data')
        .select('*')
        .single();
    if (error) {
        console.error('Error fetching company data:', error);
        return null;
    }
    return data as CompanyData;
}


export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
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
