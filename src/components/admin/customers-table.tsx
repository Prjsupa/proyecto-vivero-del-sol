
'use client';

import type { Client, Product, Service, CashAccount, Seller } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, isValid } from 'date-fns';
import { User } from "lucide-react";
import { ClientActions } from "./client-actions";

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function CustomersTable({ customers, products, services, cashAccounts, sellers }: { customers: Client[], products: Product[], services: Service[], cashAccounts: CashAccount[], sellers: Seller[] }) {

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
                    <TableHead className="hidden sm:table-cell">Documento</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
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
                                        <AvatarFallback>{getInitials(customer.name, customer.last_name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{customer.name} {customer.last_name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <div className="flex flex-col">
                                    <span className="font-medium">{customer.document_number || 'N/A'}</span>
                                    <span className="text-xs text-muted-foreground">{customer.document_type}</span>
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {customer.phone || customer.mobile_phone || 'N/A'}
                            </TableCell>
                            <TableCell>
                                 <ClientActions client={customer} allClients={customers} allProducts={products} services={services} cashAccounts={cashAccounts} sellers={sellers}/>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center">
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
