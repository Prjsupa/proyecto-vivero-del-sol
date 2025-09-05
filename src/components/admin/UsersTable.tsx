
'use client';

import type { Profile } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import { UserActions } from "@/components/admin/UserActions";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

const roleMap: { [key: number]: { name: string; className: string } } = {
    1: { name: 'Super Admin', className: 'bg-red-500 text-white' },
    2: { name: 'Empleado', className: 'bg-blue-500 text-white' },
    3: { name: 'Cliente', className: 'bg-green-500 text-white' },
};

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function UsersTable({ users }: { users: UserWithProfile[] }) {
    const [selectedRole, setSelectedRole] = useState('todos');

    const filteredUsers = users.filter(u => {
        if (selectedRole === 'todos') return true;
        return u.rol === parseInt(selectedRole, 10);
    });

    return (
        <div>
            <div className="flex justify-end items-center pb-4">
                <div className="w-48">
                    <Label>Filtrar por rol</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="1">Super Admin</SelectItem>
                            <SelectItem value="2">Empleado</SelectItem>
                            <SelectItem value="3">Cliente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
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
                    {filteredUsers.length > 0 ? (
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
        </div>
    );
}
