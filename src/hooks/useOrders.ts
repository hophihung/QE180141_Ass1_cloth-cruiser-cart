import { useQuery } from "@tanstack/react-query";
import { getOrder, getOrders } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";

const ORDERS_KEY = ["orders"];

export const useOrders = () => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: getOrders,
    enabled: Boolean(token),
    staleTime: 1000 * 10,
  });
};

export const useOrder = (orderId: string | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: [...ORDERS_KEY, orderId],
    queryFn: () => getOrder(orderId!),
    enabled: Boolean(token && orderId),
  });
};
