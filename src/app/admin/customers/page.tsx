
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/definitions";
import { createClient } from "@/lib/supabase/server";
import { CustomersTable } from "@/components/admin/customers-table";
import { AddClientForm } from "@/components/admin/add-client-form";

async function getCustomers(): Promise<Profile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('rol', 3) // Filter for clients
        .order('last_name', { ascending: true });

    if (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
    return data;
}


export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona los clientes para la facturación.</p>
                </div>
                <AddClientForm />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>Aquí aparecerán tus clientes registrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomersTable customers={customers} />
                </CardContent>
            </Card>
        </div>
    )
}
