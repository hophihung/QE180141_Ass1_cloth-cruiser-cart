import { apiFetch } from "./api";
import type { OrderData } from "@/types/order";

export const getOrders = async (): Promise<OrderData[]> => {
  const data = (await apiFetch("/api/orders")) as OrderData[];
  return data ?? [];
};

export const getOrder = async (orderId: string): Promise<OrderData> => {
  const data = (await apiFetch(`/api/orders/${orderId}`)) as OrderData;
  return data;
};

export const createOrderFromCart = async () => {
  const data = (await apiFetch("/api/orders", {
    method: "POST",
  })) as OrderData;
  return data;
};

export const requestOrderPayment = async (orderId: string) => {
  const data = (await apiFetch(`/api/orders/${orderId}/pay`, {
    method: "POST",
  })) as { paymentUrl?: string; order?: OrderData } | null;
  if (!data?.paymentUrl) {
    throw new Error("Payment URL not returned");
  }
  return data;
};
