
import { createClient } from "@/lib/supabase/server";
import type { Provider, ProviderType } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddProviderForm } from "@/components/admin/add-provider-form";
import { ProvidersTable } from "@/components/admin/providers-table";

async function getProviders(): Promise<Provider[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching providers:', error);
        return [];
    }
    return data;
}

async function getProviderTypes(): Promise<ProviderType[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('providers')
        .select('provider_type_code, provider_type_description')
        .not('provider_type_code', 'is', null);

    if (error) {
        console.error('Error fetching provider types:', error);
        return [];
    }
    
    const uniqueTypesMap = new Map<string, ProviderType>();
    data.forEach(item => {
        if (item.provider_type_code && !uniqueTypesMap.has(item.provider_type_code)) {
            uniqueTypesMap.set(item.provider_type_code, {
                code: item.provider_type_code,
                description: item.provider_type_description || ''
            });
        }
    });

    return Array.from(uniqueTypesMap.values()).sort((a, b) => a.code.localeCompare(b.code));
}

export default async function ProvidersPage() {
    const providers = await getProviders();
    const providerTypes = await getProviderTypes();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Proveedores</h1>
                    <p className="text-muted-foreground">Gestiona los proveedores del sistema.</p>
                </div>
                <AddProviderForm providerTypes={providerTypes} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Proveedores</CardTitle>
                    <CardDescription>Aquí aparecerán tus proveedores registrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProvidersTable providers={providers} providerTypes={providerTypes}/>
                </CardContent>
            </Card>
        </div>
    )
}
