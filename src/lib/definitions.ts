

export type Profile = {
  id: string;
  updated_at: string;
  name: string;
  last_name: string;
  rol: number;
  avatar_url?: string;
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
  img_url?: string | null;
  category: 'Planta de interior' | 'Planta de exterior' | 'Planta frutal' | 'Planta ornamental' | 'Suculenta' | 'Herramienta' | 'Fertilizante' | 'Maceta' | 'Plantines';
  price: number;
  stock: number;
  available: boolean;
};

export type Order = {
  id: string;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  order_details: Json;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
