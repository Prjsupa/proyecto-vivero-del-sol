
import type { Service } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";
import { ServiceCategoryManager } from "@/components/admin/service-category-manager";
import { CreateServiceCategoryForm } from "@/components/admin/create-service-category-form";

async function getServicesAndCategories(): Promise<{ services: Service[], categories: string[] }> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching services:', error);
        return { services: [], categories: [] };
    }

    const categories = Array.from(new Set(data.map(item => item.category))).sort();

    return { services: data, categories };
}

export default async function ServiceCategoriesPage() {
    const { services, categories } = await getServicesAndCategories();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Categorías de Servicios</h1>
                    <p className="text-muted-foreground">Administra tus servicios agrupados por cada categoría.</p>
                </div>
                 <CreateServiceCategoryForm allServices={services} allCategories={categories} />
            </div>
            <ServiceCategoryManager allServices={services} allCategories={categories} />
        </div>
    )
}
