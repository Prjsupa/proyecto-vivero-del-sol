
import { CategoryProductManager } from "@/components/admin/category-product-manager";
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import type { Product } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";

async function getProductsAndCategories(): Promise<{ products: Product[], categories: string[] }> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return { products: [], categories: [] };
    }

    const categories = Array.from(new Set(data.map(item => item.category))).sort();

    return { products: data, categories };
}

export default async function CategoriesPage() {
    const { products, categories } = await getProductsAndCategories();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Categorías de Productos</h1>
                    <p className="text-muted-foreground">Administra tus productos agrupados por cada categoría.</p>
                </div>
                 <CreateCategoryForm allProducts={products} allCategories={categories} />
            </div>
            <CategoryProductManager allProducts={products} allCategories={categories} />
        </div>
    )
}
