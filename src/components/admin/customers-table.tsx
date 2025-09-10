
'use client';

import type { Profile, Product } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isValid } from 'date-fns';
import { MoreHorizontal, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { CreateInvoiceForm } from "./create-invoice-form";
import Link from "next/link";


type UserWithProfile = Profile & {
    email?: string;
    created_at: string;
}

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function CustomersTable({ customers, products }: { customers: UserWithProfile[], products: Product[] }) {

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = parseISO(dateString);
        return isValid(date) ? format(date, 'dd MMM, yyyy') : '-';
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha de registro</TableHead>
                    <TableHead>
                        <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customers.length > 0 ? (
                    customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={customer.avatar_url || ''} />
                                        <AvatarFallback>{getInitials(customer.name, customer.last_name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{customer.name} {customer.last_name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {formatDate(customer.created_at)}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                         <DropdownMenuItem>
                                             <Link href={`/admin/customers/${customer.id}`} className="w-full">
                                                Ver Detalles
                                             </Link>
                                         </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <CreateInvoiceForm customers={customers} products={products} selectedCustomerId={customer.id} triggerMode="menuitem" />
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <User className="h-12 w-12" />
                                <p className="font-semibold">No se encontraron clientes.</p>
                                <p className="text-sm">Puedes agregar un nuevo cliente para empezar.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
