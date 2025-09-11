
'use client';

import type { Invoice, Client } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from "../ui/badge";
import { formatPrice } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";


export function InvoicesTable({ invoices, customers }: { invoices: Invoice[], customers: Client[] }) {
    const [filters, setFilters] = useState({
        invoiceNumber: '',
        client: 'todos',
        paymentMethod: 'todos',
        cardType: 'todos',
        hasSecondaryPayment: false,
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
            if (filters.paymentMethod !== 'todos' && invoice.payment_method !== filters.paymentMethod && invoice.secondary_payment_method !== filters.paymentMethod) {
                return false;
            }
            if (filters.cardType !== 'todos' && invoice.card_type !== filters.cardType) {
                return false;
            }
            if (filters.hasSecondaryPayment && !invoice.has_secondary_payment) {
                return false;
            }
            return true;
        });
    }, [invoices, filters]);

    const cardTypesInUse = useMemo(() => {
        const types = new Set(invoices.map(i => i.card_type).filter(Boolean) as string[]);
        return ['todos', ...Array.from(types)];
    }, [invoices]);

    const handleRowClick = (invoiceId: string) => {
        router.push(`/admin/invoices/${invoiceId}`);
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border rounded-lg">
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
                 <Select value={filters.paymentMethod} onValueChange={(val) => handleFilterChange('paymentMethod', val)}>
                    <SelectTrigger><SelectValue placeholder="Método de Pago" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los Métodos</SelectItem>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={filters.cardType} onValueChange={(val) => handleFilterChange('cardType', val)}>
                    <SelectTrigger><SelectValue placeholder="Tipo de Tarjeta" /></SelectTrigger>
                    <SelectContent>
                        {cardTypesInUse.map(type => (
                            <SelectItem key={type} value={type}>{type === 'todos' ? 'Todas las Tarjetas' : type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                    <Checkbox id="secondary-payment-filter" checked={filters.hasSecondaryPayment} onCheckedChange={(checked) => handleFilterChange('hasSecondaryPayment', !!checked)} />
                    <label htmlFor="secondary-payment-filter" className="text-sm font-medium">Solo con abono</label>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Factura</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Detalles Pago</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id} onClick={() => handleRowClick(invoice.id)} className="cursor-pointer">
                                <TableCell>
                                    <div className="font-medium">{invoice.invoice_number}</div>
                                    <div className="text-sm text-muted-foreground">{format(parseISO(invoice.created_at), 'dd MMM, yyyy')}</div>
                                </TableCell>
                                <TableCell>{invoice.client_name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {invoice.payment_method && <Badge variant="secondary">{invoice.payment_method} {invoice.card_type && `(${invoice.card_type})`}</Badge>}
                                        {invoice.has_secondary_payment && invoice.secondary_payment_method && (
                                            <Badge variant="outline">Abono: {invoice.secondary_payment_method} {invoice.secondary_card_type && `(${invoice.secondary_card_type})`}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">{formatPrice(invoice.total_amount)}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-48 text-center">
                                No se encontraron facturas con los filtros seleccionados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
