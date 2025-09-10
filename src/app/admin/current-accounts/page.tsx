
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

async function getInvoices(): Promise<Invoice[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
    return data;
}


export default async function CurrentAccountsPage() {
    const invoices = await getInvoices();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Cuentas Corrientes</h1>
                <p className="text-muted-foreground">Gestiona los saldos y movimientos de las cuentas corrientes de tus clientes.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Estado de Cuenta de Clientes</CardTitle>
                    <CardDescription>Un resumen de todas las facturas emitidas a los clientes.</CardDescription>
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
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="font-medium">{invoice.client_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{invoice.invoice_number}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatPrice(invoice.total_amount)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        No hay facturas para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
