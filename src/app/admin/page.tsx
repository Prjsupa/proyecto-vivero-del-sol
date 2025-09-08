import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Activity, Database, DollarSign, Package, ShoppingCart, AlertTriangle, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const StatCard = ({ title, value, icon: Icon, color, description, link }: { title: string, value: string, icon: React.ElementType, color: string, description: string, link: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
       <CardFooter>
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={link}>
            Ver detalles <ArrowUpRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
);

const InfoTableCard = ({ title, headers, children, viewAllLink }: { title: string, headers: string[], children: React.ReactNode, viewAllLink: string }) => (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Link href={viewAllLink} passHref>
                <Button variant="link" className="text-sm">Ver todo</Button>
            </Link>
        </CardHeader>
        <CardContent className="flex-grow">
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

const NoDataRow = ({ colSpan, icon: Icon, message }: { colSpan: number, icon: React.ElementType, message: string }) => (
    <TableRow>
        <TableCell colSpan={colSpan} className="h-48 text-center">
             <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Icon className="h-12 w-12" />
                <p className="font-semibold">{message}</p>
            </div>
        </TableCell>
    </TableRow>
)


export default function AdminDashboard() {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-semibold">Resumen Ejecutivo</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ventas Totales" value="$0" description="+0% desde el último mes" icon={DollarSign} color="text-green-500" link="/admin/finance" />
        <StatCard title="Total Usuarios" value="0" description="+0 desde el último mes" icon={Users} color="text-blue-500" link="/admin/users" />
        <StatCard title="Productos Activos" value="0" description="0 de 0 en total" icon={Package} color="text-orange-500" link="/admin/products" />
        <StatCard title="Alertas de Stock" value="0" description="Productos con bajo stock" icon={AlertTriangle} color="text-red-500" link="/admin/stock-alerts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <InfoTableCard 
            title="Actividad Reciente" 
            headers={["Tipo", "Detalle", "Monto", "Fecha"]}
            viewAllLink="/admin/transactions"
        >
            <NoDataRow colSpan={4} icon={Activity} message="Sin actividad reciente"/>
        </InfoTableCard>

        <InfoTableCard 
            title="Alerta de stock de productos" 
            headers={["Producto", "Cantidad", "Acción"]}
            viewAllLink="/admin/stock-alerts"
        >
             <NoDataRow colSpan={3} icon={AlertTriangle} message="No hay alertas de stock"/>
        </InfoTableCard>
      </div>
    </div>
  );
}
