
'use client';

import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, Package, Users, LayoutGrid, Receipt, BookUser, Building2, ShoppingBag, BarChart3, Settings, ChevronRight } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";
import { BranchSwitcher } from "@/components/admin/branch-switcher";
import useBranchStore from "@/hooks/use-branch-store";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";


export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const { activeBranch } = useBranchStore();
    const [inventarioOpen, setInventarioOpen] = useState(false);
    const [ventasOpen, setVentasOpen] = useState(false);


    return (
        <SidebarProvider>
            <div className={cn(activeBranch === 'prueba' && 'sidebar-dark-theme')}>
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
                                        <SidebarMenuItem>
                                            <Link href="/admin/categories" className="pl-6">
                                                <SidebarMenuButton variant="ghost" size="sm">
                                                    <LayoutGrid />
                                                    Categorías
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
                                        <Link href="/admin/users">
                                        <SidebarMenuButton>
                                            <Users />
                                            Usuarios
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                 <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <Building2 />
                                        Sucursales
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
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
