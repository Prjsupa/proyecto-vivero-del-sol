
'use client';

import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, Package, DollarSign, Users, Settings, BarChart, Wrench, LayoutGrid, Receipt, BookUser } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";
import { BranchSwitcher } from "@/components/admin/branch-switcher";
import useBranchStore from "@/hooks/use-branch-store";
import { cn } from "@/lib/utils";


export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const { activeBranch } = useBranchStore();

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
                                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                                <SidebarMenuItem>
                                    <Link href="/admin">
                                        <SidebarMenuButton>
                                            <Briefcase />
                                            Resumen
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/products">
                                        <SidebarMenuButton>
                                            <Package />
                                            Productos
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/categories">
                                        <SidebarMenuButton>
                                            <LayoutGrid />
                                            Categorías
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/customers">
                                        <SidebarMenuButton>
                                            <Users />
                                            Clientes
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/invoicing">
                                        <SidebarMenuButton>
                                            <Receipt />
                                            Facturación
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/current-accounts">
                                        <SidebarMenuButton>
                                            <BookUser />
                                            Cuentas Corrientes
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/users">
                                        <SidebarMenuButton>
                                            <Users />
                                            Usuarios
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarGroup>

                            <SidebarGroup>
                                <SidebarGroupLabel>Análisis</SidebarGroupLabel>
                                <SidebarMenuItem>
                                        <Link href="/admin/finance">
                                        <SidebarMenuButton>
                                            <DollarSign />
                                            Finanzas
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/reports">
                                        <SidebarMenuButton>
                                            <BarChart />
                                            Reportes
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarGroup>
                            <SidebarGroup>
                                <SidebarGroupLabel>Sistema</SidebarGroupLabel>
                                <SidebarMenuItem>
                                        <Link href="/admin/system-config">
                                        <SidebarMenuButton>
                                            <Settings />
                                            Configuración
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                        <Link href="/admin/maintenance">
                                        <SidebarMenuButton>
                                            <Wrench />
                                            Mantenimiento
                                        </SidebarMenuButton>
                                    </Link>
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
