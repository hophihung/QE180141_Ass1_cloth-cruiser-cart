import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const productId = product.id || product._id;

  const handleAddToCart = async () => {
    if (!productId) {
      toast({
        title: "Unable to add item",
        description: "Missing product identifier",
        variant: "destructive",
      });
      return;
    }

    try {
      await addItem.mutateAsync({ productId });
      toast({ title: "Added to cart", description: product.name });
    } catch (error: any) {
      toast({
        title: "Unable to add item",
        description: error?.message || "Please log in and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/20">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Link to={`/product/${product.id}`}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </Link>

          {!product.inStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <Link to={`/product/${product.id}`}>
              <h3 className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              ${product.price}
            </span>

            <Button
              size="sm"
              disabled={!product.inStock || !productId || addItem.isPending}
              onClick={handleAddToCart}
              className="gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {addItem.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>

          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
