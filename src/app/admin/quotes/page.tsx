
import { createClient } from "@/lib/supabase/server";
import type { Product, Service, Client, Currency } from "@/lib/definitions";
import { QuoteBuilder } from "@/components/admin/quote-builder";
import { cookies } from "next/headers";

async function getData() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: products, error: productsError } = await supabase.from('products').select('*');
    if (productsError) console.error('Error fetching products:', productsError);

    const { data: services, error: servicesError } = await supabase.from('services').select('*');
    if (servicesError) console.error('Error fetching services:', servicesError);

    const { data: clients, error: clientsError } = await supabase.from('clients').select('*');
    if (clientsError) console.error('Error fetching clients:', clientsError);

    const { data: currencies, error: currenciesError } = await supabase.from('currencies').select('*');
    if (currenciesError) console.error('Error fetching currencies:', currenciesError);

    return {
        products: products || [],
        services: services || [],
        clients: clients || [],
        currencies: currencies || [],
    }
}

export default async function QuotesPage() {
    const { products, services, clients, currencies } = await getData();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Armador de Presupuestos</h1>
                    <p className="text-muted-foreground">Crea presupuestos personalizados para tus clientes.</p>
                </div>
            </div>
            <QuoteBuilder products={products} services={services} clients={clients} currencies={currencies} />
        </div>
    );
}
