
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        {children}
    </SidebarProvider>
  );
}
