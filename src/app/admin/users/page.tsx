
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { UserActions } from "@/components/admin/UserActions";
import { createClient } from "@/lib/supabase/server";

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

// Esta función ahora usa la clave de servicio para obtener todos los usuarios de forma segura.
async function getUsers(): Promise<UserWithProfile[]> {
    // Es seguro usar process.env aquí porque este es un Server Component.
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { get: () => undefined } } // No necesitamos cookies para el cliente de admin
    );

    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
        console.error('Error fetching users from auth:', usersError);
        return [];
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*');

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
    }

    const combined = users.map(user => {
        const profile = profiles.find(p => p.id === user.id);
        return {
            ...profile,
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            name: profile?.name || 'No',
            last_name: profile?.last_name || 'Profile',
            rol: profile?.rol || 3, // Default to client if no profile
        };
    });

    return combined as UserWithProfile[];
}

const roleMap: { [key: number]: { name: string; className: string } } = {
    1: { name: 'Admin', className: 'bg-red-500 text-white' },
    2: { name: 'Empleado', className: 'bg-blue-500 text-white' },
    3: { name: 'Cliente', className: 'bg-green-500 text-white' },
};

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}


export default async function UsersPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();
    
    if (profile?.rol !== 1) {
        redirect('/');
    }
    
    const users = await getUsers();

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
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead className="hidden sm:table-cell">Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="hidden md:table-cell">Fecha de registro</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((userProfile) => (
                                <TableRow key={userProfile.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={userProfile.avatar_url || ''} />
                                                <AvatarFallback>{getInitials(userProfile.name, userProfile.last_name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{userProfile.name} {userProfile.last_name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{ userProfile.email }</TableCell>
                                    <TableCell>
                                        <Badge className={roleMap[userProfile.rol]?.className || ''}>
                                            {roleMap[userProfile.rol]?.name || 'Desconocido'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {format(parseISO(userProfile.created_at), 'dd MMM, yyyy')}
                                    </TableCell>
                                     <TableCell>
                                        <UserActions userProfile={userProfile} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

