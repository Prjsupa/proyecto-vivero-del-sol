
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Quote, Client } from "@/lib/definitions";
import { QuotesList } from "@/components/admin/quotes-list";

async function getData() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const [quotesData, clientsData] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name, last_name').order('last_name', { ascending: true })
    ]);

    if (quotesData.error) console.error('Error fetching quotes:', quotesData.error);
    if (clientsData.error) console.error('Error fetching clients:', clientsData.error);

    return {
        quotes: (quotesData.data as Quote[]) || [],
        clients: (clientsData.data as Client[]) || [],
    }
}

export default async function QuotesListPage() {
    const { quotes, clients } = await getData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Listado de Presupuestos</h1>
                    <p className="text-muted-foreground">Explora, filtra y gestiona todos los presupuestos guardados.</p>
                </div>
            </div>
            <QuotesList quotes={quotes} clients={clients} />
        </div>
    )
}
