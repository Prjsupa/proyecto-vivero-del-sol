
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  last_name: string;
  rol: number;
  avatar_url?: string | null;
  cuit?: string | null; // CUIT/DNI del cliente
  address?: string | null;
  city?: string | null;
  province?: string | null;
  phone?: string | null;
  iva_condition?: string | null; // Condición ante el IVA
};

export type User = {
  id: string;
  email?: string;
  // Add any other user properties you need
};

export type Product = {
  id: string;
  created_at: string;
  name: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  precio_costo: number;
  precio_venta: number;
  stock: number;
  available: boolean;
  sku?: string | null;
  img_url?: string | null;
};

export type Service = {
  id: string;
  created_at: string;
  name: string;
  description?: string | null;
  category: string;
  precio_venta: number;
  available: boolean;
  sku?: string | null;
};


export type Order = {
  id: string;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  order_details: Json;
};

export type Invoice = {
  id: string;
  created_at: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  products: Json;
  total_amount: number;
  invoice_type: 'A' | 'B';
  payment_method?: string | null;
  card_type?: string | null;
  has_secondary_payment?: boolean;
  secondary_payment_method?: string | null;
  secondary_card_type?: string | null;
  notes?: string | null;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
