
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

    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return [];
    }

    const userIds = usersData.users.map(u => u.id);

    const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .in('id', userIds);
    
    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
    }

    const profilesMap = new Map(profilesData.map(p => [p.id, p]));

    const allUsers = usersData.users.map(user => {
        const profile = profilesMap.get(user.id);
        return {
            id: user.id,
            name: profile?.name || 'N/A',
            last_name: profile?.last_name || 'N/A',
            rol: profile?.rol || 3,
            avatar_url: profile?.avatar_url,
            updated_at: profile?.updated_at || new Date().toISOString(),
            email: user.email,
            created_at: user.created_at,
        };
    });

    return allUsers as UserWithProfile[];
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
