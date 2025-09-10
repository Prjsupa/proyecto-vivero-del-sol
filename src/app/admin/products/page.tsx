
import { AddProductForm } from "@/components/admin/add-product-form";
import { ProductList } from "@/components/admin/product-list";
import { UploadCsvForm } from "@/components/admin/upload-csv-form";
import type { Product } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";
import { ExportInventoryButton } from "@/components/admin/export-inventory-button";

async function getProducts(): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

async function getCategories(): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('category');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Use a Set to get unique categories and then convert it back to an array
    const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
    return uniqueCategories.sort();
}


export default async function ProductsPage() {
    const products = await getProducts();
    const categories = await getCategories();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Productos</h1>
                    <p className="text-muted-foreground">Añade, edita y gestiona todos los productos de tu vivero.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <ExportInventoryButton />
                    <UploadCsvForm />
                    <AddProductForm categories={categories}/>
                </div>
            </div>
            <ProductList products={products} categories={categories} />
        </div>
    );
}

