'use client';

import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, Package, Users, Receipt, BookUser, Wrench, ShoppingBag, BarChart3, Settings, ChevronRight, Building2, ConciergeBell, FileText, Database, Search, Ticket, Gift, Building, ClipboardList, List } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";
import { BranchSwitcher } from "@/components/admin/branch-switcher";
import useBranchStore from "@/hooks/use-branch-store";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";

export function AdminLayoutContainer({ children }: { children: React.ReactNode }) {
    const { activeBranch } = useBranchStore();
    const [inventarioOpen, setInventarioOpen] = useState(false);
    const [serviciosOpen, setServiciosOpen] = useState(false);
    const [ventasOpen, setVentasOpen] = useState(false);
    const [descuentoOpen, setDescuentoOpen] = useState(false);
    const [proveedoresOpen, setProveedoresOpen] = useState(false);
    const [mantenimientoOpen, setMantenimientoOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className={cn(
                activeBranch === 'prueba' && 'sidebar-dark-theme',
                activeBranch === 'vivero-del-sol' && 'sidebar-green-theme'
            )}>
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex flex-col items-center justify-center p-4">
                            <Image 
                                src="https://fqkxbtahfsiebrphgzwg.supabase.co/storage/v1/object/public/vivero.logos/LOGOS_BLANCOS_Mesa_de_trabajo-1.png"
                                alt="Vivero Del Sol Logo 1"
                                width={210}
                                height={140}
                            />
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Sucursal</SidebarGroupLabel>
                            <BranchSwitcher />
                        </SidebarGroup>
                        
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <Link href="/admin">
                                        <SidebarMenuButton>
                                            <Briefcase />
                                            Resumen
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        
                        <SidebarGroup>
                            <SidebarMenu>
                                <Collapsible open={inventarioOpen} onOpenChange={setInventarioOpen}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Package />
                                                    <span>Inventario</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", inventarioOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-4 space-y-1 py-2">
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/products">
                                                        <Package />
                                                        Productos
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>
                                
                                <Collapsible open={serviciosOpen} onOpenChange={setServiciosOpen}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ConciergeBell />
                                                    <span>Servicios</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", serviciosOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-4 space-y-1 py-2">
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/services">
                                                        <ConciergeBell />
                                                        Listado Servicios
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/quotes">
                                                        <ClipboardList />
                                                        Armar Presupuesto
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/quotes/list">
                                                        <List />
                                                        Listado Presupuestos
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>

                                <Collapsible open={ventasOpen} onOpenChange={setVentasOpen}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag />
                                                    <span>Ventas</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", ventasOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-4 space-y-1 py-2">
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/customers">
                                                        <Users />
                                                        Clientes
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/sellers">
                                                        <Users />
                                                        Vendedores
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/invoicing">
                                                        <Receipt />
                                                        Facturación
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/current-accounts">
                                                        <BookUser />
                                                        Cuentas Corrientes
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>

                                <Collapsible open={descuentoOpen} onOpenChange={setDescuentoOpen}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Ticket />
                                                    <span>Descuento</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", descuentoOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-4 space-y-1 py-2">
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <Ticket />
                                                    Cupones
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/promotions">
                                                        <Gift />
                                                        Promociones
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>

                                <Collapsible open={proveedoresOpen} onOpenChange={setProveedoresOpen}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Building2 />
                                                    <span>Proveedores</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", proveedoresOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-4 space-y-1 py-2">
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/providers">
                                                        <Users />
                                                        Proveedores
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <BookUser />
                                                    Cuentas Corrientes
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <Receipt />
                                                    Facturas Proveedores
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <FileText />
                                                    Nota Débito Prov.
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <FileText />
                                                    Nota Crédito Prov.
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <Search />
                                                    Consulta de Facturas
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <FileText />
                                                    Rem. Proveedores
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton className="opacity-50 cursor-not-allowed">
                                                    <ShoppingBag />
                                                    Pedidos a Proveed.
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>

                                <Collapsible open={mantenimientoOpen} onOpenChange={setMantenimientoOpen}>
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Wrench />
                                                    <span>Mantenimiento</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", mantenimientoOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    </SidebarMenuItem>
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="ml-4 space-y-1 py-2">
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/aux-tables">
                                                        <Database />
                                                        Tablas Auxiliares
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem className="py-1">
                                                <SidebarMenuSubButton asChild>
                                                    <Link href="/admin/company-data">
                                                        <Building />
                                                        Datos de la Empresa
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Collapsible>

                                <SidebarMenuItem>
                                    <Link href="/admin/users">
                                        <SidebarMenuButton>
                                            <Users />
                                            Admins
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <SidebarMenuButton className="opacity-50 cursor-not-allowed">
                                        <Settings />
                                        Configuración
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            </div>
            <div className="flex flex-col w-full bg-muted/40">
                <Header />
                <SidebarInset>
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
