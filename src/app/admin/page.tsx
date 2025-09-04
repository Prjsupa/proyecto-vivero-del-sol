import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">Resumen Ejecutivo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$125,430</p>
            <p className="text-sm text-muted-foreground">+12% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nuevos Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">350</p>
            <p className="text-sm text-muted-foreground">+50 esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">42</p>
            <p className="text-sm text-muted-foreground">Listos para envío</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
