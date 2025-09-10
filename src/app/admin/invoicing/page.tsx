
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoicingPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Facturación</h1>
                <p className="text-muted-foreground">Crea y gestiona las facturas de tus ventas.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Facturación</CardTitle>
                    <CardDescription>La interfaz de facturación POS aparecerá aquí.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">Próximamente...</p>
                </CardContent>
            </Card>
        </div>
    )
}
