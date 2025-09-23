export interface Product {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}