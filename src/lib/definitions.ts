
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  last_name: string;
  avatar_url?: string | null;
  // rol has been removed
};

export type CompanyData = {
    id: number;
    razon_social?: string | null;
    nombre_fantasia?: string | null;
    domicilio?: string | null;
    localidad?: string | null;
    provincia?: string | null;
    telefono?: string | null;
    cuit?: string | null;
    tipo_resp?: string | null;
    ing_brutos?: string | null;
    inicio_activ?: string | null;
    web?: string | null;
    whatsapp?: string | null;
    updated_at?: string | null;
};

export type Client = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  last_name: string;
  razon_social?: string | null;
  nombre_fantasia?: string | null;
  iva_condition?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  price_list?: string | null;
  province?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  mobile_phone?: string | null;
  email?: string | null;
  default_invoice_type?: 'A' | 'B' | 'C' | null;
  birth_date?: string | null;
}

export type Seller = {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    last_name: string;
    address?: string | null;
    dni?: string | null;
    phone?: string | null;
    authorized_discount?: number | null;
    cash_sale_commission?: number | null;
    collection_commission?: number | null;
}

export type Provider = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  provider_type_code?: string | null;
  provider_type_description?: string | null;
}

export type ProviderType = {
    code: string;
    description: string;
}

export type IncomeVoucher = {
    code: string;
    description: string;
}

export type ExpenseVoucher = {
    code: string;
    description: string;
}

export type UnitOfMeasure = {
    code: string;
    description: string;
}

export type UnitOfTime = {
    code: string;
    description: string;
}

export type UnitOfMass = {
    code: string;
    description: string;
}

export type UnitOfVolume = {
    code: string;
    description: string;
}

export type PointOfSale = {
    code: string;
    description: string;
}

export type AccountStatus = {
    code: string;
    description: string;
}

export type Currency = {
    code: string;
    description: string;
}

export type CashAccount = {
    code: string;
    description: string;
    account_type?: string | null;
}


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
  color?: string | null;
  tamaño?: string | null;
  proveedor?: string | null;
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

export type Promotion = {
    id: number;
    created_at: string;
    updated_at: string;
    name: string;
    is_active: boolean;
    discount_type: 'x_for_y' | 'price_discount' | 'cross_selling' | 'progressive_discount';
    discount_value: jsonb;
    apply_to_type: 'all_store' | 'all_products' | 'all_services' | 'product_categories' | 'product_subcategories' | 'service_categories' | 'products' | 'services';
    apply_to_ids?: string[] | null;
    can_be_combined: boolean;
    usage_limit_type: 'unlimited' | 'period';
    start_date?: string | null;
    end_date?: string | null;
    custom_tag?: string | null;
}

export type Quote = {
  id: string;
  created_at: string;
  title: string;
  client_id: number;
  client_name: string;
  items: Json;
  total_amount: number;
  currency: string;
  valid_until: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}


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
  client_id: number;
  client_name: string;
  branch_id?: string | null;
  branch_name?: string | null;
  seller_id?: number | null;
  seller_name?: string | null;
  products: Json;
  total_amount: number;
  invoice_type: 'A' | 'B' | 'C';
  payment_condition?: string | null;
  notes?: string | null;
  subtotal?: number | null;
  vat_type?: string | null;
  vat_rate?: number | null;
  vat_amount?: number | null;
  discounts_total?: number | null;
  promotions_applied?: Json | null; // e.g., [{ name: string, amount: number }]
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type jsonb = Json;



