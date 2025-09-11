
'use client';

import type { Profile } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from 'date-fns';

type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function UsersTable({ users }: { users: UserWithProfile[] }) {
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha de registro</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length > 0 ? (
                    users.map((userProfile) => (
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
                            <TableCell className="hidden md:table-cell">
                                {format(parseISO(userProfile.created_at), 'dd MMM, yyyy')}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-48 text-center">
                            No se encontraron administradores.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
