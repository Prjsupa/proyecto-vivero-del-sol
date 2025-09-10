
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/lib/definitions";
import { CustomersTable } from "@/components/admin/customers-table";
import { AddClientForm } from "@/components/admin/add-client-form";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import Link from "next/link";


type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

async function getCustomers(): Promise<UserWithProfile[]> {
    const cookieStore = cookies();
    
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );

    // Get all users from auth
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
        console.error('Error fetching users:', usersError);
        return [];
    }

    // Get all profiles
    const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*');
    
    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
    }

    const profilesMap = new Map(profilesData.map(p => [p.id, p]));

    const clients = usersData.users
        .map(user => {
            const profile = profilesMap.get(user.id);
            if (profile && profile.rol === 3) { // Filter for clients (rol = 3)
                return {
                    id: user.id,
                    name: profile.name || 'N/A',
                    last_name: profile.last_name || 'N/A',
                    rol: profile.rol,
                    avatar_url: profile.avatar_url,
                    updated_at: profile.updated_at || new Date().toISOString(),
                    email: user.email,
                    created_at: user.created_at,
                };
            }
            return null;
        })
        .filter(Boolean) as UserWithProfile[];

    // Sort clients by last name
    clients.sort((a, b) => a.last_name.localeCompare(b.last_name));
    
    return clients;
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
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/admin/invoicing">
                            <Receipt className="mr-2 h-4 w-4" />
                            Crear Factura
                        </Link>
                    </Button>
                    <AddClientForm />
                </div>
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
