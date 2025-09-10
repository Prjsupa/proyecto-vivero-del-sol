
import { AddServiceForm } from "@/components/admin/add-service-form";
import { ServiceList } from "@/components/admin/service-list";
import type { Service } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";

async function getServices(): Promise<Service[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }

    return data;
}

async function getCategories(): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('services').select('category');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
    return uniqueCategories.sort();
}


export default async function ServicesPage() {
    const services = await getServices();
    const categories = await getCategories();

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Servicios</h1>
                    <p className="text-muted-foreground">Añade, edita y gestiona todos los servicios de tu vivero.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <AddServiceForm categories={categories}/>
                </div>
            </div>
            <ServiceList services={services} categories={categories} />
        </div>
    );
}
