import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestOrderPayment } from "@/lib/orders";
import { apiFetch } from "@/lib/api";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useOrder(id);

  // Handle order not found error
  useEffect(() => {
    if (isError && id) {
      toast({
        title: "Order not found",
        description: `Order with ID ${id} could not be found. This might be due to a payment cancellation or the order being deleted.`,
        variant: "destructive",
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [isError, id, navigate, toast]);

  // Lấy status từ URL khi PayOS callback và xóa params
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("status");
  const isCallback = !!params.get("code");

  // Poll order status after payment callback
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    const pollCount = 0;
    const MAX_POLLS = 10; // Maximum number of polling attempts (20 seconds total)

    if (isCallback && paymentStatus && id) {
      console.log("🔄 Starting payment status polling");

      // Start polling immediately
      const pollStatus = async () => {
        try {
          console.log(`📊 Polling attempt ${pollCount + 1}/${MAX_POLLS}`);

          await refetch();
          const order = queryClient.getQueryData(["order", id]) as
            | { status: string }
            | undefined;

          console.log("🔍 Current order status:", order?.status);

          if (order?.status === "paid") {
            console.log("✅ Payment confirmed as paid");
            clearInterval(pollInterval);
            toast({
              title: "Payment Successful",
              description: "Your order has been paid successfully.",
              variant: "default",
            });

            // Redirect đến trang danh sách orders sau khi xác nhận thanh toán
            setTimeout(() => {
              navigate("/orders", { replace: true });
            }, 2000);
          }
        } catch (error) {
          console.error("Error polling order status:", error);
          clearInterval(pollInterval);
        }
      };

      // Poll every 2 seconds
      pollInterval = setInterval(pollStatus, 2000);

      // Initial check
      pollStatus();

      // Cleanup
      return () => {
        if (pollInterval) {
          clearInterval(pollInterval);
        }
      };
    }
  }, [isCallback, paymentStatus, id, queryClient, refetch, navigate, toast]);

  const updateOrderStatus = useMutation({
    mutationFn: async () => {
      return apiFetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        json: {
          status: "paid",
          paymentInfo: {
            paidAt: new Date().toISOString(),
            status: paymentStatus,
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });

  useEffect(() => {
    if (isCallback) {
      if (paymentStatus === "success" || paymentStatus === "PAID") {
        toast({
          title: "Payment Successful",
          description: "Your order has been paid successfully.",
          variant: "default",
        });
        // Cập nhật trạng thái đơn hàng thành paid
        updateOrderStatus.mutate();
        // Refetch để cập nhật trạng thái order
        refetch();
        
        // Redirect đến trang danh sách orders sau khi thanh toán thành công
        setTimeout(() => {
          navigate("/orders", { replace: true });
        }, 2000); // Delay 2 giây để user thấy thông báo
      } else if (
        paymentStatus === "cancelled" ||
        paymentStatus === "CANCELLED"
      ) {
        toast({
          title: "Payment Cancelled",
          description: "The payment was cancelled.",
          variant: "default",
        });
        // Redirect đến trang danh sách orders khi hủy thanh toán
        setTimeout(() => {
          navigate("/orders", { replace: true });
        }, 2000);
      } else {
        // Clear URL params cho các trường hợp khác
        navigate(`/orders/${id}`, { replace: true });
      }
    }
  }, [isCallback, paymentStatus, id, navigate, refetch, toast, updateOrderStatus]);

  const payMutation = useMutation({
    mutationFn: async () => {
      const result = await requestOrderPayment(id!);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "Redirecting to PayOS",
        description: "You will be taken to the PayOS payment gateway.",
      });
      // Redirect to PayOS payment page
      window.location.href = result.paymentUrl;
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to process payment",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Please sign in to view orders
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
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : isError || !data ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Unable to load order.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    Order #{data.id.slice(-6)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Placed on {format(new Date(data.createdAt), "PPP p")}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full capitalize border text-sm">
                  {data.status}
                </span>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Total amount: ${data.totalAmount.toFixed(2)}</p>
                <p>Items: {data.items.length}</p>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Items</h2>
              <div className="space-y-4">
                {data.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.name}`}
                    className="flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {item.quantity} • ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <span className="font-semibold">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              {data.status === "paid" ? (
                <div className="text-sm text-muted-foreground">
                  <p>This order has been marked as paid.</p>
                  {data.paymentInfo?.paymentId && (
                    <p>Payment ID: {String(data.paymentInfo.paymentId)}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Payment not completed yet.</p>
                  <Button
                    onClick={() => payMutation.mutateAsync()}
                    disabled={payMutation.isPending}
                    className="gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {payMutation.isPending ? "Processing..." : "Pay with PayOS"}
                  </Button>
                </div>
              )}
            </div>

            <div className="text-center">
              <Button variant="link" asChild>
                <Link to="/orders">Back to all orders</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderDetailPage;
