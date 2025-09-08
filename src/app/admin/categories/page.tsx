
import { CategoryProductManager } from "@/components/admin/category-product-manager";
import { SubcategoryProductManager } from "@/components/admin/subcategory-product-manager";
import { CreateCategoryForm } from "@/components/admin/create-category-form";
import type { Product } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { CreateSubcategoryForm } from "@/components/admin/create-subcategory-form";

async function getProductsAndCategories(): Promise<{ products: Product[], categories: string[], subcategories: string[] }> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return { products: [], categories: [], subcategories: [] };
    }

    const categories = Array.from(new Set(data.map(item => item.category))).sort();
    const subcategories = Array.from(new Set(data.map(item => item.subcategory).filter(Boolean) as string[])).sort();

    return { products: data, categories, subcategories };
}

export default async function CategoriesPage() {
    const { products, categories, subcategories } = await getProductsAndCategories();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión por Categorías</h1>
                    <p className="text-muted-foreground">Administra tus productos agrupados por cada categoría.</p>
                </div>
                 <CreateCategoryForm allProducts={products} allCategories={categories} />
            </div>
            <CategoryProductManager allProducts={products} allCategories={categories} />
            
            <Separator className="my-8"/>

             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión por Subcategorías</h1>
                    <p className="text-muted-foreground">Administra tus productos agrupados por cada subcategoría.</p>
                </div>
                <CreateSubcategoryForm allProducts={products} allSubcategories={subcategories} />
            </div>
            <SubcategoryProductManager allProducts={products} allSubcategories={subcategories} />
        </div>
    )
}
