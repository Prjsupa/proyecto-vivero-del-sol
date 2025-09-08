import { AddProductForm } from "@/components/admin/add-product-form";
import { ProductList } from "@/components/admin/product-list";
import { UploadCsvForm } from "@/components/admin/upload-csv-form";
import type { Product } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";

async function getProducts(): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}


export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Productos</h1>
                    <p className="text-muted-foreground">Añade, edita y gestiona todos los productos de tu vivero.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <UploadCsvForm />
                    <AddProductForm />
                </div>
            </div>
            <ProductList products={products} />
        </div>
    );
}
