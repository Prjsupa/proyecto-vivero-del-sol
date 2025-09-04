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
};
