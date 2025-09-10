
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExportInvoicesButton } from "@/components/admin/export-invoices-button";

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
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="text-2xl font-semibold">Cuentas Corrientes</h1>
                    <p className="text-muted-foreground">Gestiona los saldos y movimientos de las cuentas corrientes de tus clientes.</p>
                </div>
                 <div className="flex items-center gap-2">
                     <ExportInvoicesButton invoices={invoices} />
                </div>
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
