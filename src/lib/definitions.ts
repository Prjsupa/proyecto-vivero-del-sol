
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
  img_url: string;
  category: 'Planta de interior' | 'Planta de exterior' | 'Planta frutal' | 'Planta ornamental' | 'Suculenta' | 'Herramienta' | 'Fertilizante' | 'Maceta';
  price: number;
  stock: number;
  available: boolean;
}
