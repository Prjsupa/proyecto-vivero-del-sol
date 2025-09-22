
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Client, Invoice } from "@/lib/definitions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookUser, Mail, Phone, User, FileText, Home, Cake } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { InvoicesTable } from "@/components/admin/invoices-table";
import { Separator } from "@/components/ui/separator";
import { cookies } from "next/headers";

interface CustomerDetailPageProps {
    params: {
        id: string;
    }
}

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

async function getClientDetails(clientId: string): Promise<{ client: Client, invoices: Invoice[] }> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
    
    if (clientError || !client) {
        notFound();
    }

    const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

    if (invoicesError) {
        console.error("Error fetching client invoices", invoicesError);
    }
    
    return { client, invoices: invoices || [] };
}


export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    const { client, invoices } = await getClientDetails(params.id);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" size="icon" className="h-8 w-8">
                    <Link href="/admin/customers">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold">Detalles del Cliente</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center">
                             <Avatar className="h-24 w-24 mb-4">
                                <AvatarFallback className="text-4xl">{getInitials(client.name, client.last_name)}</AvatarFallback>
                            </Avatar>
                            <CardTitle>{client.name} {client.last_name}</CardTitle>
                            <CardDescription>
                                {client.razon_social || client.nombre_fantasia || 'Cliente'}
                            </CardDescription>
                            <CardDescription>Cliente desde {format(parseISO(client.created_at), 'MMM yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <Separator />
                             <div className="flex items-start gap-3 pt-4">
                                <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Información Fiscal</p>
                                    <p className="text-muted-foreground">{client.document_type || 'Documento'}: {client.document_number || 'No especificado'}</p>
                                    <p className="text-muted-foreground">IVA: {client.iva_condition || 'No especificado'}</p>
                                    <p className="text-muted-foreground">Factura por defecto: {client.default_invoice_type || 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Home className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Dirección</p>
                                    <p className="text-muted-foreground">{client.address || 'No especificada'}</p>
                                    <p className="text-muted-foreground">{client.city}, {client.province} {client.postal_code}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Email</p>
                                    <p className="text-muted-foreground">{client.email || 'No especificado'}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Teléfonos</p>
                                    <p className="text-muted-foreground">Celular: {client.mobile_phone || 'No especificado'}</p>
                                    <p className="text-muted-foreground">Fijo: {client.phone || 'No especificado'}</p>
                                </div>
                            </div>
                             {client.birth_date && isValid(parseISO(client.birth_date)) && (
                                <div className="flex items-start gap-3">
                                    <Cake className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Fecha de Nacimiento</p>
                                        <p className="text-muted-foreground">{format(parseISO(client.birth_date), 'dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>
                 <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookUser className="h-5 w-5"/>
                                Historial de Facturas
                            </CardTitle>
                             <CardDescription>
                                Un resumen de todas las facturas asociadas a este cliente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InvoicesTable invoices={invoices} customers={[client]} sellers={[]} />
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )

}
