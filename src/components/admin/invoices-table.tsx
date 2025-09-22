
'use client';

import type { Invoice, Client, Seller } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from "../ui/badge";
import { formatPrice } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useRouter } from "next/navigation";


interface InvoicesTableProps {
    invoices: Invoice[];
    customers: Client[];
    sellers: Seller[];
}

export function InvoicesTable({ invoices, customers, sellers }: InvoicesTableProps) {
    const [filters, setFilters] = useState({
        invoiceNumber: '',
        client: 'todos',
        paymentCondition: 'todos',
    });
    const router = useRouter();


    const handleFilterChange = (key: keyof typeof filters, value: string | boolean) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            if (filters.invoiceNumber && !invoice.invoice_number.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) {
                return false;
            }
            if (filters.client !== 'todos' && String(invoice.client_id) !== filters.client) {
                return false;
            }
            if (filters.paymentCondition !== 'todos' && invoice.payment_condition !== filters.paymentCondition) {
                return false;
            }
            return true;
        });
    }, [invoices, filters]);

    const handleRowClick = (invoiceId: string) => {
        router.push(`/admin/invoices/${invoiceId}`);
    }

    const getSellerCommission = (invoice: Invoice) => {
        if (!invoice.seller_id) return null;
        const seller = sellers.find(s => s.id === invoice.seller_id);
        if (!seller) return null;

        if (invoice.payment_condition === 'Efectivo') {
            return seller.cash_sale_commission;
        }
        // Assuming other conditions fall under collection commission
        return seller.collection_commission;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
                 <Input 
                    placeholder="Buscar por Nº Factura..."
                    value={filters.invoiceNumber}
                    onChange={(e) => handleFilterChange('invoiceNumber', e.target.value)}
                />
                 <Select value={filters.client} onValueChange={(val) => handleFilterChange('client', val)}>
                    <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los Clientes</SelectItem>
                        {customers.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} {c.last_name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={filters.paymentCondition} onValueChange={(val) => handleFilterChange('paymentCondition', val)}>
                    <SelectTrigger><SelectValue placeholder="Condición de Venta" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todas las Condiciones</SelectItem>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Tarjeta de crédito">Tarjeta de crédito</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Factura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Sucursal</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Condición de Venta</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => {
                            const commission = getSellerCommission(invoice);
                            return (
                                <TableRow key={invoice.id} onClick={() => handleRowClick(invoice.id)} className="cursor-pointer">
                                    <TableCell>
                                        <div className="font-medium">{invoice.invoice_number}</div>
                                        <div className="text-sm text-muted-foreground">{format(parseISO(invoice.created_at), 'dd MMM, yyyy')}</div>
                                    </TableCell>
                                    <TableCell>{invoice.client_name}</TableCell>
                                    <TableCell>{invoice.branch_name ?? '-'}</TableCell>
                                    <TableCell>
                                        <div>{invoice.seller_name ?? '-'}</div>
                                        {commission !== null && (
                                            <div className="text-xs text-muted-foreground">Comisión: {commission}%</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {invoice.payment_condition && <Badge variant="secondary">{invoice.payment_condition}{invoice.notes ? ` - ${invoice.notes}` : ''}</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatPrice(invoice.total_amount)}</TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center">
                                No se encontraron facturas con los filtros seleccionados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
