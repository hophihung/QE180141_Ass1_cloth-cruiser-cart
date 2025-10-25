import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart";
import { useAuth } from "@/context/AuthContext";

const CART_QUERY_KEY = ["cart"];

export const useCart = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: getCart,
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

  const addItem = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity?: number;
    }) => addCartItem(productId, quantity ?? 1),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItem(productId, quantity),
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: invalidate,
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
    addItem,
    updateItem,
    removeItem,
    clear,
  };
};

export const useCartCount = () => {
  const { cart } = useCart();
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
};
