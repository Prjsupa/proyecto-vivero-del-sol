
import { createClient } from "@/lib/supabase/server";
import type { Client, Product, CashAccount, Service } from "@/lib/definitions";
import { CreateInvoiceForm } from "@/components/admin/create-invoice-form";
import { cookies } from "next/headers";

async function getClients(): Promise<Client[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('last_name', { ascending: true });
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data as Client[];
}

async function getProducts(): Promise<Product[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
}

async function getServices(): Promise<Service[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  return data as Service[];
}

async function getCashAccounts(): Promise<CashAccount[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('cash_accounts')
    .select('*')
    .order('description', { ascending: true });
  if (error) {
    console.error('Error fetching cash accounts:', error);
    return [];
  }
  return data as CashAccount[];
}

export default async function NewInvoicePage() {
  const [clients, products, services, cashAccounts] = await Promise.all([
    getClients(),
    getProducts(),
    getServices(),
    getCashAccounts(),
  ]);

  // Render full-page CreateInvoiceForm
  return (
    <CreateInvoiceForm customers={clients} products={products} services={services} cashAccounts={cashAccounts} asPage />
  );
}
