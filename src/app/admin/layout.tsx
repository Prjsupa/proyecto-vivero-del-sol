import { Header } from "@/components/vivero/header";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { Briefcase, DollarSign, Users, Settings, BarChart, Wrench, Sprout, ShoppingBag } from "lucide-react";
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
                    <span className="font-headline text-2xl font-bold tracking-wide text-foreground">
                        Admin Panel
                    </span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarGroup>
                            <SidebarGroupLabel>Menu</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <Link href="/admin">
                                        <SidebarMenuButton>
                                            <Briefcase />
                                            Resumen ejecutivo
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                     <Link href="/admin/products">
                                        <SidebarMenuButton>
                                            <ShoppingBag />
                                            Gestión de productos
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                     <Link href="/admin/finance">
                                        <SidebarMenuButton>
                                            <DollarSign />
                                            Análisis financiero
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                 <SidebarMenuItem>
                                     <Link href="/admin/users">
                                        <SidebarMenuButton>
                                            <Users />
                                            Gestión de usuarios
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                 <SidebarMenuItem>
                                     <Link href="/admin/system-config">
                                        <SidebarMenuButton>
                                            <Settings />
                                            Configuración del sistema
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                     <Link href="/admin/reports">
                                        <SidebarMenuButton>
                                            <BarChart />
                                            Reportes estratégicos
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
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <div className="flex flex-col w-full">
            <Header />
            <SidebarInset>
                {children}
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
