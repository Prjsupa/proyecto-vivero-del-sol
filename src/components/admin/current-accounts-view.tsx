
'use client';
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice, Profile } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookUser, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ExportInvoicesButton } from "./export-invoices-button";

export function CurrentAccountsView({ invoices, customers }: { invoices: Invoice[], customers: Profile[] }) {
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
    }

    const filteredInvoices = useMemo(() => {
        if (!selectedClientId) {
            return [];
        }
        return invoices.filter(invoice => invoice.client_id === selectedClientId);
    }, [invoices, selectedClientId]);

    const clientBalance = useMemo(() => {
        return filteredInvoices.reduce((acc, invoice) => acc + invoice.total_amount, 0);
    }, [filteredInvoices]);

    const selectedCustomerName = useMemo(() => {
        if (!selectedClientId) return '';
        const customer = customers.find(c => c.id === selectedClientId);
        return customer ? `${customer.name} ${customer.last_name}` : '';
    }, [customers, selectedClientId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Estado de Cuenta de Cliente</CardTitle>
                <CardDescription>Selecciona un cliente para ver el detalle de sus facturas y su saldo total.</CardDescription>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
                     <div className="flex flex-col gap-2 w-full md:w-72">
                        <Select onValueChange={handleClientChange} value={selectedClientId || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un cliente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(customer => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                        {customer.name} {customer.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedClientId && (
                            <div className="text-sm text-muted-foreground">
                                <p><span className="font-semibold text-foreground">{filteredInvoices.length}</span> facturas encontradas.</p>
                                <p>Saldo total: <span className="font-semibold text-foreground">{formatPrice(clientBalance)}</span></p>
                            </div>
                        )}
                    </div>
                     <div className="self-start">
                        <ExportInvoicesButton invoices={filteredInvoices} disabled={filteredInvoices.length === 0} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Nº Factura</TableHead>
                             <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedClientId ? (
                            filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                                         <TableCell>
                                             <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full">
                                                {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                             <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full font-medium">
                                                <Badge variant="outline">{invoice.invoice_number}</Badge>
                                            </Link>
                                        </TableCell>
                                         <TableCell>
                                             <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full">
                                                <Badge variant="secondary">{invoice.invoice_type}</Badge>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full font-mono">
                                                {formatPrice(invoice.total_amount)}
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <BookUser className="h-12 w-12" />
                                            <p className="font-semibold">No se encontraron facturas para {selectedCustomerName}.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <User className="h-12 w-12" />
                                        <p className="font-semibold">Por favor, selecciona un cliente para comenzar.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
