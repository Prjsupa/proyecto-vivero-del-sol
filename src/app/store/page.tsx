
import { ProductCatalog } from "@/components/vivero/product-catalog";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/definitions";

async function getProducts(): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

export default async function StorePage() {
    const products = await getProducts();
    
    return (
        <div>
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold font-headline">Nuestros Productos</h1>
                <p className="text-lg text-muted-foreground font-body">Explora nuestra selección de plantas y herramientas de jardinería.</p>
            </div>
            <ProductCatalog products={products} />
        </div>
    )
}
