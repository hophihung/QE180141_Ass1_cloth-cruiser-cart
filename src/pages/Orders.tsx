import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, PackageSearch } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useOrders();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground mt-2">
              Review your recent purchases and track their status.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        {!user ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-4">
              Sign in to view your orders
            </h2>
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              Unable to load orders right now.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : !data?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <PackageSearch className="w-10 h-10 mx-auto mb-4" />
            <p>No orders placed yet.</p>
            <Button className="mt-4" onClick={() => navigate("/products")}>
              Start shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((order) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Order #{order.id.slice(-6)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Placed on {format(new Date(order.createdAt), "PPP p")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm capitalize"
                      data-status={order.status}
                    >
                      {order.status}
                    </span>
                    <span className="font-semibold text-lg">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <Button asChild size="sm">
                      <Link to={`/orders/${order.id}`}>View details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrdersPage;
