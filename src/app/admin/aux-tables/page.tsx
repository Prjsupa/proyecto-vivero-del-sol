
import { createClient } from "@/lib/supabase/server";
import type { Product, Service } from "@/lib/definitions";
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

    const productCategories = Array.from(new Set((products || []).map(item => item.category))).sort();
    const productSubcategories = Array.from(new Set((products || []).map(item => item.subcategory).filter(Boolean) as string[])).sort();
    const serviceCategories = Array.from(new Set((services || []).map(item => item.category))).sort();

    return { 
        products: products || [], 
        services: services || [],
        productCategories, 
        productSubcategories,
        serviceCategories 
    };
}


export default async function AuxTablesPage() {
    const data = await getData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Tablas Auxiliares</h1>
                    <p className="text-muted-foreground">Administra las categorías y subcategorías para tus productos y servicios.</p>
                </div>
            </div>
            <AuxTablesManager 
                products={data.products}
                services={data.services}
                productCategories={data.productCategories}
                productSubcategories={data.productSubcategories}
                serviceCategories={data.serviceCategories}
            />
        </div>
    )
}
