export interface OrderItem {
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export interface OrderData {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentInfo: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
