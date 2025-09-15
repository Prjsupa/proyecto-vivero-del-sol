
import { createClient } from "@/lib/supabase/server";
import type { Product, Service, Provider, ProviderType } from "@/lib/definitions";
import { AuxTablesManager } from "@/components/admin/aux-tables-manager";

async function getData() {
    const supabase = createClient();
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (productsError) console.error('Error fetching products:', productsError);

    const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });
    
    if (servicesError) console.error('Error fetching services:', servicesError);

    const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .order('name', { ascending: true });

    if (providersError) console.error('Error fetching providers:', providersError);
    
    const { data: providerTypes, error: providerTypesError } = await supabase
        .from('provider_types')
        .select('*')
        .order('code', { ascending: true });
    
    if (providerTypesError) console.error('Error fetching provider types:', providerTypesError);


    const productCategories = Array.from(new Set((products || []).map(item => item.category))).sort();
    const productSubcategories = Array.from(new Set((products || []).map(item => item.subcategory).filter(Boolean) as string[])).sort();
    const serviceCategories = Array.from(new Set((services || []).map(item => item.category))).sort();
    
    const productColors = Array.from(new Set((products || []).map(item => item.color).filter(Boolean) as string[])).sort();
    const productSizes = Array.from(new Set((products || []).map(item => item.tamaño).filter(Boolean) as string[])).sort();
    const productDescriptions = Array.from(new Set((products || []).map(item => item.description).filter(Boolean) as string[])).sort();
    const serviceDescriptions = Array.from(new Set((services || []).map(item => item.description).filter(Boolean) as string[])).sort();


    return { 
        products: products || [], 
        services: services || [],
        providers: providers || [],
        providerTypes: providerTypes || [],
        productCategories, 
        productSubcategories,
        serviceCategories,
        productColors,
        productSizes,
        productDescriptions,
        serviceDescriptions
    };
}


export default async function AuxTablesPage() {
    const data = await getData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Tablas Auxiliares</h1>
                    <p className="text-muted-foreground">Administra las categorías y otros atributos para tus productos y servicios.</p>
                </div>
            </div>
            <AuxTablesManager 
                products={data.products}
                services={data.services}
                providers={data.providers}
                providerTypes={data.providerTypes}
                productCategories={data.productCategories}
                productSubcategories={data.productSubcategories}
                serviceCategories={data.serviceCategories}
                productColors={data.productColors}
                productSizes={data.productSizes}
                productDescriptions={data.productDescriptions}
                serviceDescriptions={data.serviceDescriptions}
            />
        </div>
    )
}
