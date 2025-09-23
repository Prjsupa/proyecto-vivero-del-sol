
import { createClient } from "@/lib/supabase/server";
import type { Product, Service, Client, Currency } from "@/lib/definitions";
import { cookies } from "next/headers";
import { QuoteBuilder } from "@/components/admin/quote-builder";

async function getData() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const [productsData, servicesData, clientsData, currenciesData] = await Promise.all([
        supabase.from('products').select('*').order('name', { ascending: true }),
        supabase.from('services').select('*').order('name', { ascending: true }),
        supabase.from('clients').select('*').order('last_name', { ascending: true }),
        supabase.from('currencies').select('*').order('code', { ascending: true })
    ]);

    if (productsData.error) console.error('Error fetching products:', productsData.error);
    if (servicesData.error) console.error('Error fetching services:', servicesData.error);
    if (clientsData.error) console.error('Error fetching clients:', clientsData.error);
    if (currenciesData.error) console.error('Error fetching currencies:', currenciesData.error);

    return {
        products: (productsData.data as Product[]) || [],
        services: (servicesData.data as Service[]) || [],
        clients: (clientsData.data as Client[]) || [],
        currencies: (currenciesData.data as Currency[]) || [],
    };
}


export default async function QuotesPage() {
    const { products, services, clients, currencies } = await getData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Armador de Presupuestos</h1>
                    <p className="text-muted-foreground">Crea y guarda presupuestos para tus clientes.</p>
                </div>
            </div>
            <QuoteBuilder products={products} services={services} clients={clients} currencies={currencies} />
        </div>
    )
}
