
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona los clientes para la facturación.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>Aquí aparecerán tus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Aún no hay clientes para mostrar.</p>
                </CardContent>
            </Card>
        </div>
    )
}
