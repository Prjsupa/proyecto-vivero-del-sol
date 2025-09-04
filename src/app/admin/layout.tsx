import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Briefcase, DollarSign, Users, Settings, BarChart, Wrench, Sprout } from "lucide-react";
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        <SidebarInset>
            {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
