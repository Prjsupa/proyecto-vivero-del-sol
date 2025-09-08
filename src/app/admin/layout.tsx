import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, Package, DollarSign, Users, Settings, BarChart, Wrench, Sprout, ShoppingBag } from "lucide-react";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
                 <div className="flex items-center gap-2 p-2">
                    <Sprout className="h-8 w-8 text-primary" />
                    <span className="font-bold text-lg tracking-wide text-sidebar-primary">
                        Admin
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
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
