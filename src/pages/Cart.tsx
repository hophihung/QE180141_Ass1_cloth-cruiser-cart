import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, isLoading, isError, refetch, updateItem, removeItem, clear } =
    useCart();
  const [optimisticQuantities, setOptimisticQuantities] = useState<
    Record<string, number>
  >({});

  // Treat only valid Mongo ObjectIds as updatable product IDs
  const isValidObjectId = (id?: string) => !!id && /^[a-f\d]{24}$/i.test(id);

  useEffect(() => {
    if (cart) {
      const map: Record<string, number> = {};
      cart.items.forEach((item) => {
        if (isValidObjectId(item.product.id)) {
          map[item.product.id] = item.quantity;
        }
      });
      setOptimisticQuantities(map);
    }
  }, [cart]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    setOptimisticQuantities((prev) => ({ ...prev, [productId]: quantity }));
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 0) return;
    try {
      await updateItem.mutateAsync({ productId, quantity });
      toast({ title: "Cart updated" });
    } catch (error: any) {
      toast({
        title: "Unable to update item",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
      refetch();
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem.mutateAsync(productId);
      toast({ title: "Item removed" });
    } catch (error: any) {
      toast({
        title: "Unable to remove item",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clear.mutateAsync();
      toast({ title: "Cart cleared" });
    } catch (error: any) {
      toast({
        title: "Unable to clear cart",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const totalItems = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-2">
              {totalItems} item{totalItems === 1 ? "" : "s"} in your cart
            </p>
          </div>
          {cart?.items.length ? (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={clear.isPending}
            >
              Clear Cart
            </Button>
          ) : null}
        </div>

        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-4">
              Please sign in to view your cart
            </h2>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Unable to load cart.</p>
            <Button onClick={() => refetch()} variant="outline">
              Try again
            </Button>
          </div>
        ) : !cart?.items.length ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <Button onClick={() => navigate("/products")}>
              Browse products
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-4">
              {cart.items.map((item, index) => {
                const pid = isValidObjectId(item.product.id)
                  ? item.product.id
                  : null;
                const key = pid ?? `noid-${index}`;
                const qtyValue = pid
                  ? optimisticQuantities[pid] ?? item.quantity
                  : item.quantity;
                const controlsDisabled = !pid;
                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                          {!pid && (
                            <p className="text-xs text-muted-foreground mt-1">
                              This item can't be updated or removed (missing
                              product reference).
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={controlsDisabled}
                              onClick={() => {
                                if (!pid) return;
                                handleQuantityChange(
                                  pid,
                                  Math.max(
                                    0,
                                    (optimisticQuantities[pid] ??
                                      item.quantity) - 1
                                  )
                                );
                              }}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              className="w-16 text-center border-none"
                              type="number"
                              min={0}
                              disabled={controlsDisabled}
                              value={qtyValue}
                              onChange={(event) => {
                                if (!pid) return;
                                handleQuantityChange(
                                  pid,
                                  Number(event.target.value)
                                );
                              }}
                              onBlur={() => {
                                if (!pid) return;
                                handleUpdateQuantity(
                                  pid,
                                  optimisticQuantities[pid] ?? item.quantity
                                );
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={controlsDisabled}
                              onClick={() => {
                                if (!pid) return;
                                handleQuantityChange(
                                  pid,
                                  (optimisticQuantities[pid] ?? item.quantity) +
                                    1
                                );
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            disabled={controlsDisabled}
                            onClick={() => {
                              if (!pid) return;
                              handleRemoveItem(pid);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <span className="font-semibold text-lg">
                        ${(item.unitPrice * qtyValue).toFixed(2)}
                      </span>
                      {pid && optimisticQuantities[pid] !== item.quantity && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateQuantity(
                                pid,
                                optimisticQuantities[pid] ?? item.quantity
                              )
                            }
                            disabled={updateItem.isPending}
                          >
                            Update
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              pid && handleQuantityChange(pid, item.quantity)
                            }
                          >
                            Reset
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border rounded-lg p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>${(cart?.totalAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm mb-6 text-muted-foreground">
                <span>Tax</span>
                <span>—</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${(cart?.totalAmount ?? 0).toFixed(2)}</span>
              </div>
              <Button
                className="w-full mt-6"
                onClick={() => navigate("/checkout")}
                disabled={!cart?.items.length}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="link"
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
