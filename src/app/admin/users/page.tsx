
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { UserActions } from "@/components/admin/UserActions";

async function getUsers(): Promise<Profile[]> {
    const supabase = createClient();
    // We can't query the auth.users table directly for all users without service_role key.
    // So we will query the profiles table instead, which should contain all users.
    const { data, error } = await supabase
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
        `)
        .order('created_at', { referencedTable: 'users', ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    // Combine profile data with user data
    return data.map((profile: any) => ({
        ...profile,
        email: profile.users.email,
        created_at: profile.users.created_at,
    }));
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
                                    <TableCell className="hidden sm:table-cell">{ (userProfile as any).email }</TableCell>
                                    <TableCell>
                                        <Badge className={roleMap[userProfile.rol]?.className || ''}>
                                            {roleMap[userProfile.rol]?.name || 'Desconocido'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {format(parseISO((userProfile as any).created_at), 'dd MMM, yyyy')}
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

