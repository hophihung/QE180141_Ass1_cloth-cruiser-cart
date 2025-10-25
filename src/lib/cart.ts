import { apiFetch } from "./api";
import type { CartData } from "@/types/cart";

export const getCart = async (): Promise<CartData> => {
  const data = (await apiFetch("/api/cart")) as CartData;
  return data;
};

export const addCartItem = async (productId: string, quantity = 1) => {
  return apiFetch("/api/cart/items", {
    method: "POST",
    json: { productId, quantity },
  }) as Promise<CartData>;
};

export const updateCartItem = async (productId: string, quantity: number) => {
  return apiFetch(`/api/cart/items/${productId}`, {
    method: "PATCH",
    json: { quantity },
  }) as Promise<CartData>;
};

export const removeCartItem = async (productId: string) => {
  return apiFetch(`/api/cart/items/${productId}`, {
    method: "DELETE",
  }) as Promise<CartData>;
};

export const clearCart = async () => {
  return apiFetch(`/api/cart`, {
    method: "DELETE",
  }) as Promise<CartData>;
};
