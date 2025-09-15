

'use client';

import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, Package, Users, LayoutGrid, Receipt, BookUser, Wrench, ShoppingBag, BarChart3, Settings, ChevronRight, Building2, ConciergeBell, FileText, Database, Search } from "lucide-react";
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
                        <SidebarMenu>
                             <SidebarGroup>
                                 <SidebarGroupLabel>Sucursal</SidebarGroupLabel>
                                 <BranchSwitcher />
                            </SidebarGroup>
                            <SidebarGroup>
                                 <SidebarMenuItem>
                                    <Link href="/admin">
                                        <SidebarMenuButton>
                                            <Briefcase />
                                            Resumen
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarGroup>
                            
                            <Collapsible open={inventarioOpen} onOpenChange={setInventarioOpen}>
                                <SidebarGroup>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="justify-between">
                                            <div className="flex items-center gap-2">
                                                <Package />
                                                <span>Inventario</span>
                                            </div>
                                            <ChevronRight className={cn("transform transition-transform duration-200", inventarioOpen && "rotate-90")} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                     <CollapsibleContent className="data-[state=open]:py-1">
                                        <SidebarMenuItem>
                                            <Link href="/admin/products" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <Package />
                                                    Productos
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                            
                            <Collapsible open={serviciosOpen} onOpenChange={setServiciosOpen}>
                                <SidebarGroup>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="justify-between">
                                            <div className="flex items-center gap-2">
                                                <ConciergeBell />
                                                <span>Servicios</span>
                                            </div>
                                            <ChevronRight className={cn("transform transition-transform duration-200", serviciosOpen && "rotate-90")} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                     <CollapsibleContent className="data-[state=open]:py-1">
                                         <SidebarMenuItem>
                                            <Link href="/admin/services" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <ConciergeBell />
                                                    Listado Servicios
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>

                            <Collapsible open={ventasOpen} onOpenChange={setVentasOpen}>
                                <SidebarGroup>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="justify-between">
                                            <div className="flex items-center gap-2">
                                                <ShoppingBag />
                                                <span>Ventas</span>
                                            </div>
                                            <ChevronRight className={cn("transform transition-transform duration-200", ventasOpen && "rotate-90")} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                     <CollapsibleContent className="data-[state=open]:py-1">
                                        <SidebarMenuItem>
                                            <Link href="/admin/customers" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <Users />
                                                    Clientes
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="/admin/sellers" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <Users />
                                                    Vendedores
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="/admin/invoicing" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <Receipt />
                                                    Facturación
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="/admin/current-accounts" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <BookUser />
                                                    Cuentas Corrientes
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>

                            <Collapsible open={proveedoresOpen} onOpenChange={setProveedoresOpen}>
                                <SidebarGroup>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="justify-between">
                                            <div className="flex items-center gap-2">
                                                <Building2 />
                                                <span>Proveedores</span>
                                            </div>
                                            <ChevronRight className={cn("transform transition-transform duration-200", proveedoresOpen && "rotate-90")} />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                     <CollapsibleContent className="data-[state=open]:py-1">
                                        <SidebarMenuItem>
                                            <Link href="/admin/providers" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <Users />
                                                    Proveedores
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <BookUser />
                                                    Cuentas Corrientes
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <Receipt />
                                                    Facturas Proveedores
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <FileText />
                                                    Nota Débito Prov.
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                         <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <FileText />
                                                    Nota Crédito Prov.
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                         <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <Search />
                                                    Consulta de Facturas
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <FileText />
                                                    Rem. Proveedores
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <Link href="#" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm" disabled>
                                                    <ShoppingBag />
                                                    Pedidos a Proveed.
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                            
                             <SidebarGroup>
                                <SidebarGroupLabel>Análisis</SidebarGroupLabel>
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <BarChart3 />
                                        Reportes
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarGroup>

                             <SidebarGroup>
                                <SidebarGroupLabel>Sistema</SidebarGroupLabel>
                                <SidebarMenuItem>
                                    <Link href="/admin/docs">
                                        <SidebarMenuButton>
                                            <FileText />
                                            Novedades
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <Link href="/admin/users">
                                        <SidebarMenuButton>
                                            <Users />
                                            Admins
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <Collapsible open={mantenimientoOpen} onOpenChange={setMantenimientoOpen}>
                                    <SidebarGroup>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton className="justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Wrench />
                                                    <span>Mantenimiento</span>
                                                </div>
                                                <ChevronRight className={cn("transform transition-transform duration-200", mantenimientoOpen && "rotate-90")} />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="data-[state=open]:py-1">
                                             <SidebarMenuItem>
                                                <Link href="/admin/aux-tables" className="pl-6">
                                                    <SidebarMenuButton variant="ghost" size="sm">
                                                        <Database />
                                                        Tablas Auxiliares
                                                    </SidebarMenuButton>
                                                </Link>
                                            </SidebarMenuItem>
                                        </CollapsibleContent>
                                    </SidebarGroup>
                                </Collapsible>
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <Settings />
                                        Configuración
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarGroup>
                        </SidebarMenu>
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
