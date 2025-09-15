
import { createClient } from "@/lib/supabase/server";
import { PromotionsTable } from "@/components/admin/promotions-table";
import { AddPromotionForm } from "@/components/admin/add-promotion-form";
import type { Product, Service } from "@/lib/definitions";

async function getData() {
    const supabase = createClient();
    const { data: products, error: productsError } = await supabase.from('products').select('*');
    if (productsError) console.error('Error fetching products:', productsError);

    const { data: services, error: servicesError } = await supabase.from('services').select('*');
    if (servicesError) console.error('Error fetching services:', servicesError);

    const { data: promotions, error: promotionsError } = await supabase.from('promotions').select('*');
    if (promotionsError) console.error('Error fetching promotions:', promotionsError);
    
    const { data: productCategoriesData, error: productCategoriesError } = await supabase.from('products').select('category');
    if(productCategoriesError) console.error('Error fetching product categories:', productCategoriesError);
    const productCategories = Array.from(new Set((productCategoriesData || []).map(p => p.category)));

    const { data: serviceCategoriesData, error: serviceCategoriesError } = await supabase.from('services').select('category');
    if(serviceCategoriesError) console.error('Error fetching service categories:', serviceCategoriesError);
    const serviceCategories = Array.from(new Set((serviceCategoriesData || []).map(s => s.category)));

    return {
        products: products || [],
        services: services || [],
        promotions: promotions || [],
        productCategories,
        serviceCategories,
    }
}


export default async function PromotionsPage() {
    const { products, services, promotions, productCategories, serviceCategories } = await getData();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Promociones</h1>
                    <p className="text-muted-foreground">Crea, edita y gestiona las promociones de tu tienda.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <AddPromotionForm 
                        products={products}
                        services={services}
                        productCategories={productCategories}
                        serviceCategories={serviceCategories}
                    />
                </div>
            </div>
            <PromotionsTable promotions={promotions} />
        </div>
    );
}
