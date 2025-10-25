export interface CartProductSnapshot {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  inStock?: boolean;
}

export interface CartItem {
  product: CartProductSnapshot;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartData {
  id: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
