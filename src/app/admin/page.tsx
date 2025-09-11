
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/definitions";
import { DashboardClient } from "@/components/admin/dashboard-client";

async function getDashboardData() {
    const supabase = createClient();
    
    // Fetch all data in parallel
    const [productsData, clientsData] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('clients').select('id', { count: 'exact' })
    ]);
    
    const { data: products, error: productsError } = productsData;
    const { count: clientsCount, error: clientsError } = clientsData;

    if (productsError) console.error("Error fetching products:", productsError.message);
    if (clientsError) console.error("Error fetching clients:", clientsError.message);
    
    const activeProducts = products?.filter(p => p.available).length || 0;
    const totalProducts = products?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock < 10) || [];

    return {
        totalSales: 0,
        clientsCount: clientsCount || 0,
        activeProducts,
        totalProducts,
        lowStockAlerts: lowStockProducts.length,
        lowStockProducts,
    }
}

export default async function AdminDashboard() {
  const dashboardData = await getDashboardData();
  
  return <DashboardClient data={dashboardData} />;
}
