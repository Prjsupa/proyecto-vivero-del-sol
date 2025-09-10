
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Activity, Package, DollarSign, Users, AlertTriangle, ArrowUpRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/definitions";

type SortConfig = {
    key: string;
    direction: 'ascending' | 'descending';
};

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

const InfoTableCard = ({ title, headers, children, viewAllLink, onSort, sortableColumns }: { title: string, headers: string[], children: React.ReactNode, viewAllLink: string, onSort?: (column: string) => void, sortableColumns?: string[] }) => (
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
                        {headers.map((header) => (
                           <TableHead key={header}>
                                {sortableColumns?.includes(header.toLowerCase()) ? (
                                    <Button variant="ghost" onClick={() => onSort?.(header.toLowerCase())} className="px-0">
                                        {header}
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    header
                                )}
                            </TableHead>
                        ))}
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
);

type DashboardData = {
    totalSales: number;
    clientsCount: number;
    activeProducts: number;
    totalProducts: number;
    lowStockAlerts: number;
    lowStockProducts: Product[];
}

export function DashboardClient({ data }: { data: DashboardData }) {
    const { clientsCount, activeProducts, totalProducts, lowStockAlerts, lowStockProducts } = data;
    const [lowStockSort, setLowStockSort] = useState<SortConfig | null>(null);

    const sortedLowStockProducts = useMemo(() => {
        let sortableItems = [...lowStockProducts];
        if (lowStockSort !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[lowStockSort.key as keyof Product];
                const bValue = b[lowStockSort.key as keyof Product];
                
                if (aValue < bValue) {
                    return lowStockSort.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return lowStockSort.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [lowStockProducts, lowStockSort]);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (lowStockSort && lowStockSort.key === key && lowStockSort.direction === 'ascending') {
            direction = 'descending';
        }
        setLowStockSort({ key, direction });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h1 className="text-2xl font-semibold">Resumen Ejecutivo</h1>
                <div className="mt-2 md:mt-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span>{format(subDays(new Date(), 30), "LLL dd, y")} - {format(new Date(), "LLL dd, y")}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={subDays(new Date(), 30)}
                                selected={{ from: subDays(new Date(), 30), to: new Date() }}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Ventas Totales" value="$0" description="+0% desde el último mes" icon={DollarSign} color="text-green-500" link="/admin/finance" />
                <StatCard title="Total Clientes" value={clientsCount.toString()} description="+0 desde el último mes" icon={Users} color="text-blue-500" link="/admin/users" />
                <StatCard title="Productos Activos" value={activeProducts.toString()} description={`${totalProducts} en total`} icon={Package} color="text-orange-500" link="/admin/products" />
                <StatCard title="Alertas de Stock" value={lowStockAlerts.toString()} description="Productos con bajo stock" icon={AlertTriangle} color="text-red-500" link="/admin/products" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoTableCard 
                    title="Actividad Reciente" 
                    headers={["Tipo", "Detalle", "Monto", "Fecha"]}
                    viewAllLink="/admin/transactions"
                    sortableColumns={["monto", "fecha"]}
                >
                    <NoDataRow colSpan={4} icon={Activity} message="Sin actividad reciente"/>
                </InfoTableCard>

                <InfoTableCard 
                    title="Alerta de stock de productos" 
                    headers={["Producto", "Stock"]}
                    viewAllLink="/admin/products"
                    onSort={requestSort}
                    sortableColumns={["producto", "stock"]}
                >
                    {sortedLowStockProducts.length > 0 ? (
                        sortedLowStockProducts.map(product => (
                            <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <NoDataRow colSpan={2} icon={AlertTriangle} message="No hay alertas de stock"/>
                    )}
                </InfoTableCard>
            </div>
        </div>
    );
}
