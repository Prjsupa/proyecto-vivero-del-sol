
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function InvoicingPage() {
    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Facturas</h1>
                    <p className="text-muted-foreground">Visualiza, filtra y exporta todas las facturas emitidas.</p>
                </div>
                 <div className="flex items-center gap-2">
                     <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4"/>
                        Exportar
                    </Button>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Listado de Facturas</CardTitle>
                    <CardDescription>Aquí aparecerá la lista de facturas con sus filtros correspondientes.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Próximamente: Interfaz de visualización de facturas...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
