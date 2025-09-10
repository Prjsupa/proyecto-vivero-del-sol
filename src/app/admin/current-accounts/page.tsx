
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CurrentAccountsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Cuentas Corrientes</h1>
                <p className="text-muted-foreground">Gestiona los saldos y movimientos de las cuentas corrientes de tus clientes.</p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Cuentas Corrientes</CardTitle>
                    <CardDescription>Aquí aparecerá el estado de cuenta de los clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Próximamente: Interfaz de Cuentas Corrientes...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
