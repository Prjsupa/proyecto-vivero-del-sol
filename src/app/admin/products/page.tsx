
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/definitions";
import { cookies } from "next/headers";
import { ProductList } from "@/components/admin/product-list";
import { AddProductForm } from "@/components/admin/add-product-form";
import { UploadCsvForm } from "@/components/admin/upload-csv-form";
import { ExportInventoryButton } from "@/components/admin/export-inventory-button";

async function getData() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: products, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productsError) console.error('Error fetching products:', productsError);

    const { data: categoriesData, error: categoriesError } = await supabase.from('products').select('category');
    if (categoriesError) console.error('Error fetching categories:', categoriesError);
    
    const categories = Array.from(new Set((categoriesData || []).map(p => p.category)));

    return {
        products: products || [],
        categories: categories.sort() || [],
    }
}


export default async function ProductsPage() {
    const { products, categories } = await getData();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Productos</h1>
                    <p className="text-muted-foreground">Añade, edita y gestiona todos los productos de tu vivero.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <UploadCsvForm />
                    <ExportInventoryButton />
                    <AddProductForm categories={categories} />
                </div>
            </div>
            <ProductList products={products} categories={categories} />
        </div>
    );
}
