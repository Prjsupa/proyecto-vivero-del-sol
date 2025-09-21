
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
    
    let client: Client | null = null;
    if (invoice.client_id) {
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', invoice.client_id)
            .single();

        if (clientError) {
            console.error('Error fetching client for invoice:', clientError);
        }
        client = clientData;
    }
    
    return { invoice, client };
}

async function getCompanyData(): Promise<CompanyData | null> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('company_data')
        .select('*')
        .eq('id', 1)
        .single();
    if (error) {
        console.error('Error fetching company data:', error);
        return null;
    }
    return data as CompanyData;
}

async function getCashAccounts(): Promise<CashAccount[]> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('cash_accounts')
        .select('*')
        .order('description', { ascending: true });
    if (error) {
        console.error('Error fetching cash accounts:', error);
        return [];
    }
    return data as CashAccount[];
}


export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    const [{ invoice, client }, company, cashAccounts] = await Promise.all([
        getInvoiceAndClient(params.id),
        getCompanyData(),
        getCashAccounts()
    ]);


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

                <InvoiceView invoice={invoice} client={client} company={company} cashAccounts={cashAccounts} />
            </div>
        </div>
    );
}
