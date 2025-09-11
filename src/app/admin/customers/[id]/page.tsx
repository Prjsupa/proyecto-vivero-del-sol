
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Client, Invoice } from "@/lib/definitions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BookUser, Mail, Phone, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { InvoicesTable } from "@/components/admin/invoices-table";

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

async function getClientDetails(clientId: string): Promise<{ client: Client, invoices: Invoice[] }> {
    const supabase = createClient();
    
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


export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
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
                            <CardDescription>Cliente desde {format(parseISO(client.created_at), 'MMM yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                             <div className="flex items-start gap-3">
                                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">Información Personal</p>
                                    <p className="text-muted-foreground">{client.cuit || 'CUIT/DNI no especificado'}</p>
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
                                    <p className="font-semibold">Teléfono</p>
                                    <p className="text-muted-foreground">{client.phone || 'No especificado'}</p>
                                </div>
                            </div>
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
                            <InvoicesTable invoices={invoices} customers={[client]} />
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    )

}
