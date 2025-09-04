'use client';

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { UserActions } from "@/components/admin/UserActions";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

const roleMap: { [key: number]: { name: string; className: string } } = {
    1: { name: 'Admin', className: 'bg-red-500 text-white' },
    2: { name: 'Empleado', className: 'bg-blue-500 text-white' },
    3: { name: 'Cliente', className: 'bg-green-500 text-white' },
};

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserWithProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserWithProfile[]>([]);
    const [selectedRole, setSelectedRole] = useState('todos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        async function getUsers(): Promise<UserWithProfile[]> {
            const { data, error } = await supabase.rpc('get_all_users_with_profiles');

            if (error) {
                console.error('Error fetching users:', error);
                return [];
            }
            return data as UserWithProfile[];
        }

        const checkUserAndLoadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                redirect('/auth/login');
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
            if (profile?.rol !== 1) {
                redirect('/');
                return;
            }

            setLoading(true);
            const userList = await getUsers();
            setUsers(userList);
            setFilteredUsers(userList);
            setLoading(false);
        };
        
        checkUserAndLoadData();
    }, []);

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        if (role === 'todos') {
            setFilteredUsers(users);
        } else {
            const roleId = parseInt(role, 10);
            setFilteredUsers(users.filter(u => u.rol === roleId));
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">Visualiza y gestiona los roles de todos los usuarios.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                             <CardTitle>Usuarios</CardTitle>
                            <CardDescription>
                                Una lista de todos los usuarios del sistema.
                            </CardDescription>
                        </div>
                        <div className="w-48">
                            <Label>Filtrar por rol</Label>
                            <Select value={selectedRole} onValueChange={handleRoleChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="1">Admin</SelectItem>
                                    <SelectItem value="2">Empleado</SelectItem>
                                    <SelectItem value="3">Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        Cargando usuarios...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((userProfile) => (
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
                                        <TableCell className="hidden sm:table-cell">{userProfile.email}</TableCell>
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        No se encontraron usuarios para el rol seleccionado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
