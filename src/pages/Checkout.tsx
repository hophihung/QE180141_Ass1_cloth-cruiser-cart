import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { createOrderFromCart } from "@/lib/orders";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cart, isLoading } = useCart();

  const orderMutation = useMutation({
    mutationFn: () => createOrderFromCart(),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Order placed",
        description: "Your order has been created successfully",
      });
      navigate(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Unable to place order",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = async () => {
    await orderMutation.mutateAsync();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Please sign in to continue checkout
          </h1>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !cart || !cart.items.length ? (
          <div className="text-center py-16">
            <p className="text-lg mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate("/products")}>
              Browse products
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-10">
            <div className="space-y-6">
              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order items</h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty {item.quantity} • ${item.unitPrice.toFixed(2)}{" "}
                          each
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping</h2>
                <p className="text-sm text-muted-foreground">
                  This demo does not collect shipping details. Update this
                  section with a form if you need to capture shipping
                  information.
                </p>
              </section>

              <section className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Payment is simulated for now. Click place order to create an
                  unpaid order record.
                </p>
              </section>
            </div>

            <aside className="border rounded-lg p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">Order summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
              </div>
              <div className="flex justify-between mt-6 text-lg font-semibold">
                <span>Total</span>
                <span>${cart.totalAmount.toFixed(2)}</span>
              </div>
              <Button
                className="w-full mt-6"
                onClick={handlePlaceOrder}
                disabled={orderMutation.isPending}
              >
                {orderMutation.isPending ? "Placing order..." : "Place order"}
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate("/cart")}
              >
                Back to cart
              </Button>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
