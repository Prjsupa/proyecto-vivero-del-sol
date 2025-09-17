

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
  email?: string | null;
  cuit?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  phone?: string | null;
  iva_condition?: string | null;
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

export type jsonb = Json;
