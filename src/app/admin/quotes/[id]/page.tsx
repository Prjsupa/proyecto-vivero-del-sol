

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Quote } from "@/lib/definitions";
import { QuoteView, PrintButton } from "@/components/admin/quotes/quote-view";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";

async function getQuote(quoteId: string): Promise<Quote> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
    
    if (quoteError || !quote) {
        notFound();
    }

    return quote;
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    const quote = await getQuote(params.id);

    return (
        <div className="bg-muted/40 min-h-screen print:bg-white" id="quote-page">
            <div className="container mx-auto p-4 sm:p-8">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <Button asChild variant="outline">
                        <Link href="/admin/quotes/list">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Presupuestos
                        </Link>
                    </Button>
                    <PrintButton />
                </div>

                <QuoteView quote={quote} />
            </div>
        </div>
    );
}
