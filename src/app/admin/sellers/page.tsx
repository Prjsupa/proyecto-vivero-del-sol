
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Seller } from "@/lib/definitions";
import { SellersTable } from "@/components/admin/sellers-table";
import { AddSellerForm } from "@/components/admin/add-seller-form";
import { createClient } from "@/lib/supabase/server";
import { PlusCircle } from "lucide-react";
import { cookies } from "next/headers";

async function getSellers(): Promise<Seller[]> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('last_name', { ascending: true });
    
    if (error) {
        console.error('Error fetching sellers:', error);
        return [];
    }
    return data;
}


export default async function SellersPage() {
    const sellers = await getSellers();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Vendedores</h1>
                    <p className="text-muted-foreground">Gestiona los vendedores del sistema.</p>
                </div>
                <div className="flex items-center gap-2">
                    <AddSellerForm />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Vendedores</CardTitle>
                    <CardDescription>Aquí aparecerán tus vendedores registrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SellersTable sellers={sellers} />
                </CardContent>
            </Card>
        </div>
    )
}
