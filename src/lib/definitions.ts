
export type Plant = {
  id: string;
  name: string;
  species: string;
  image: string;
  availability: 'In Stock' | 'Out of Stock';
  light: 'low' | 'medium' | 'high';
  water: 'low' | 'medium' | 'high';
  size: 'small' | 'medium' | 'large';
  careInstructions: string;
};

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
  img_url: string | null;
  category: 'Planta de interior' | 'Planta de exterior' | 'Planta frutal' | 'Planta ornamental' | 'Suculenta' | 'Herramienta' | 'Fertilizante' | 'Maceta';
  price: number;
  size: string | null;
  stock: number;
  available: boolean;
}
