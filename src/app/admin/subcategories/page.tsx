
import { SubcategoryProductManager } from "@/components/admin/subcategory-product-manager";
import { CreateSubcategoryForm } from "@/components/admin/create-subcategory-form";
import type { Product } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";

async function getProductsAndSubcategories(): Promise<{ products: Product[], subcategories: string[] }> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return { products: [], subcategories: [] };
    }

    const subcategories = Array.from(new Set(data.map(item => item.subcategory).filter(Boolean) as string[])).sort();

    return { products: data, subcategories };
}

export default async function SubcategoriesPage() {
    const { products, subcategories } = await getProductsAndSubcategories();

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Subcategorías de Productos</h1>
                    <p className="text-muted-foreground">Administra tus productos agrupados por cada subcategoría.</p>
                </div>
                <CreateSubcategoryForm allProducts={products} allSubcategories={subcategories} />
            </div>
            <SubcategoryProductManager allProducts={products} allSubcategories={subcategories} />
        </div>
    )
}
