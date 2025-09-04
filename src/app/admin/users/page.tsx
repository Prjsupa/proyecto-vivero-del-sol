
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { UsersTable } from "@/components/admin/UsersTable";


type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

async function getAllUsers(): Promise<UserWithProfile[]> {
    const cookieStore = cookies();
    
    // We need to use the service_role key to bypass RLS and get all users.
    // This is safe because this code only runs on the server.
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

    // Using an explicit join syntax that doesn't rely on Supabase's relationship detection.
    // This is more robust.
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select(`
            id, 
            updated_at,
            name,
            last_name,
            rol,
            avatar_url,
            users (
                email,
                created_at
            )
        `);

    if (error) {
        console.error('Error fetching users with service role:', error);
        return [];
    }
    
    // The query returns nested data, we need to flatten it.
    const users = data.map(profile => ({
        ...profile,
        email: (profile.users as any)?.email,
        created_at: (profile.users as any)?.created_at,
        users: undefined, // remove the nested 'users' object
    }));

    return users as UserWithProfile[];
}


export default async function UsersPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
    if (profile?.rol !== 1) {
        redirect('/');
    }
    
    const allUsers = await getAllUsers();
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Visualiza y gestiona los roles de todos los usuarios.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuarios</CardTitle>
                    <CardDescription>
                        Una lista de todos los usuarios del sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersTable users={allUsers} />
                </CardContent>
            </Card>
        </div>
    );
}

