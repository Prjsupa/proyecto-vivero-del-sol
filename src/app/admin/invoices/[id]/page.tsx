
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Invoice, Profile } from "@/lib/definitions";
import { InvoiceView, PrintButton } from "../_components/invoice-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/vivero/header";
import { Footer } from "@/components/vivero/footer";

async function getInvoiceAndProfile(invoiceId: string): Promise<{ invoice: Invoice, profile: Profile | null }> {
    const supabase = createClient();
    
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();
    
    if (invoiceError || !invoice) {
        notFound();
    }
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', invoice.client_id)
        .single();

    if (profileError) {
        console.error('Error fetching client profile for invoice:', profileError);
    }
    
    return { invoice, profile: profile || null };
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    const { invoice, profile } = await getInvoiceAndProfile(params.id);

    return (
        <div className="bg-muted/40 min-h-screen print:bg-white" id="invoice-page">
            <div className="print:hidden">
              <Header />
            </div>
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

                <InvoiceView invoice={invoice} clientProfile={profile} />
            </div>
             <div className="print:hidden">
                <Footer />
            </div>
        </div>
    );
}
