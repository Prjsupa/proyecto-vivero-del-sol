
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, PlusCircle } from "lucide-react";

export default function InvoicingPage() {
    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Facturación POS</h1>
                    <p className="text-muted-foreground">Crea y gestiona las facturas de tus ventas.</p>
                </div>
                 <div className="flex items-center gap-2">
                     <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4"/>
                        Exportar
                    </Button>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Nueva Factura
                    </Button>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Terminal de Punto de Venta (POS)</CardTitle>
                    <CardDescription>La interfaz de facturación aparecerá aquí.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Próximamente: Interfaz de Facturación POS...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
