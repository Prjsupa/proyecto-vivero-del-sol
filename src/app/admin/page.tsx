import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Database, DollarSign, ShoppingCart, AlertTriangle } from "lucide-react";
import Link from "next/link";

const StatCard = ({ title, value, count, icon: Icon, color }: { title: string, value: string, count: number, icon: React.ElementType, color: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">Total: {count}</p>
      </CardContent>
    </Card>
);

const InfoTableCard = ({ title, headers, children, viewAllLink }: { title: string, headers: string[], children: React.ReactNode, viewAllLink: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-headline">{title}</CardTitle>
            <Link href={viewAllLink} passHref>
                <Button variant="link" className="text-sm">View all</Button>
            </Link>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map((header) => <TableHead key={header}>{header}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {children}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

const NoDataRow = ({ colSpan }: { colSpan: number }) => (
    <TableRow>
        <TableCell colSpan={colSpan} className="h-48 text-center">
             <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Database className="h-12 w-12" />
                <p>Sin Datos</p>
            </div>
        </TableCell>
    </TableRow>
)


export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold font-headline">Resumen Ejecutivo</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Ventas" value="$0" count={0} icon={DollarSign} color="text-green-500" />
        <StatCard title="Total Ventas Pendientes" value="$0" count={0} icon={DollarSign} color="text-yellow-500" />
        <StatCard title="Total Compras" value="$0" count={0} icon={ShoppingCart} color="text-blue-500" />
        <StatCard title="Total Compras Pendientes" value="$0" count={0} icon={ShoppingCart} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <InfoTableCard 
            title="Ventas Recientes" 
            headers={["Invoice No", "Cliente", "Total", "Pendiente", "Pagado", "Fecha"]}
            viewAllLink="/admin/sales"
        >
            <NoDataRow colSpan={6} />
        </InfoTableCard>

         <InfoTableCard 
            title="Compras Recientes" 
            headers={["ID", "Fecha", "Proveedor", "Total", "Descuento", "Pagado"]}
            viewAllLink="/admin/purchases"
        >
            <NoDataRow colSpan={6} />
        </InfoTableCard>

         <InfoTableCard 
            title="Transacciones Recientes" 
            headers={["ID", "Fecha", "Cuenta de débito", "Cuenta de crédito", "Monto"]}
            viewAllLink="/admin/transactions"
        >
            <NoDataRow colSpan={5} />
        </InfoTableCard>

        <InfoTableCard 
            title="Alerta de stock de productos" 
            headers={["SKU", "Nombre", "Cantidad", "Precio de Compra", "Acción"]}
            viewAllLink="/admin/stock-alerts"
        >
             <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                     <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12" />
                        <p>Sin Datos</p>
                    </div>
                </TableCell>
            </TableRow>
        </InfoTableCard>
      </div>
    </div>
  );
}
