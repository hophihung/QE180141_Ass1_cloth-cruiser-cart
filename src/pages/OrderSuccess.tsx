import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";

interface OrderData {
  id: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentInfo?: {
    paidAt?: string;
  };
}

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("orderCode");
    const id = searchParams.get("orderId");
    setOrderCode(code);
    setOrderId(id);
  }, [searchParams]);

  const { data: order, isLoading, isError } = useQuery<OrderData>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("No order ID");
      const result = await apiFetch(`/api/orders/${orderId}`);
      return result;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Unable to load order details
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order information. Please check your order history.
          </p>
          <Button asChild>
            <Link to="/orders">View My Orders</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600">
              🎉 Thanh toán thành công!
            </h1>
            <p className="text-muted-foreground">
              Cảm ơn bạn đã mua sắm tại Cloth Cruiser Cart
            </p>
          </div>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Thông tin đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono font-semibold">#{order.id.slice(-6)}</span>
              </div>
              
              {orderCode && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mã thanh toán:</span>
                  <span className="font-mono font-semibold">{orderCode}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trạng thái:</span>
                <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                  {order.status === "paid" ? "Đã thanh toán" : order.status}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ngày đặt:</span>
                <span>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</span>
              </div>

              {order.paymentInfo?.paidAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngày thanh toán:</span>
                  <span>{format(new Date(order.paymentInfo.paidAt), "dd/MM/yyyy HH:mm")}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm đã mua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/products">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg">
              <Link to="/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Xem đơn hàng của tôi
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Chúng tôi sẽ gửi email xác nhận đến địa chỉ email của bạn.
            </p>
            <p className="mt-1">
              Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderSuccess;
