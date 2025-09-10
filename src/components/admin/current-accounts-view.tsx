
'use client';
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invoice } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function CurrentAccountsView({ invoices }: { invoices: Invoice[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = useMemo(() => {
        if (!searchTerm) {
            return invoices;
        }
        return invoices.filter(invoice => 
            invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [invoices, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Estado de Cuenta de Clientes</CardTitle>
                 <div className="flex flex-col md:flex-row justify-between gap-4">
                     <CardDescription>Un resumen de todas las facturas emitidas a los clientes.</CardDescription>
                     <div className="relative w-full md:w-72">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                 </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Nº Factura</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                                     <TableCell>
                                         <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full">
                                            {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                         <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full font-medium">
                                            {invoice.client_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                         <Link href={`/admin/invoices/${invoice.id}`} className="block w-full h-full">
                                            <Badge variant="outline">{invoice.invoice_number}</Badge>
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
                                    {searchTerm 
                                        ? `No se encontraron facturas para "${searchTerm}".`
                                        : "No hay facturas para mostrar."
                                    }
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
