
import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, Package, DollarSign, Users, Settings, BarChart, Wrench, LayoutGrid, Building, Receipt } from "lucide-react";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { BranchSwitcher } from "./branch-switcher";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 1) {
    redirect('/');
  }

  return (
    <SidebarProvider>
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
                                    Categorías de Productos
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
