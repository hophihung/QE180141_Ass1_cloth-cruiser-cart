import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/hero-section';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types/product';

const Index = () => {
  const {
    data: featuredProducts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Product[], Error>({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const result = await apiFetch('/api/products?limit=4');
      if (Array.isArray(result)) return result.slice(0, 4);
      if (result && typeof result === 'object' && 'data' in (result as Record<string, unknown>)) {
        const data = (result as { data?: unknown }).data;
        if (Array.isArray(data)) {
          return data.slice(0, 4) as Product[];
        }
      }
      return [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-muted-foreground">Free shipping on all orders over $50</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Easy Returns</h3>
              <p className="text-muted-foreground">30-day return policy for your peace of mind</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Secure Payment</h3>
              <p className="text-muted-foreground">Your payment information is safe with us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our hand-picked selection of the finest fashion pieces, curated just for you.
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading featured products...
            </div>
          ) : isError ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-destructive font-medium">{error?.message || 'Failed to load products'}</p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : featuredProducts.length ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No featured products available right now.
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="gap-2">
              <Link to="/products">
                View All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                review: "Amazing quality and fast shipping! The clothes fit perfectly and look even better than the photos.",
                rating: 5
              },
              {
                name: "Mike Chen",
                review: "Great customer service and trendy designs. I've become a regular customer!",
                rating: 5
              },
              {
                name: "Emma Davis",
                review: "Love the sustainable approach and the attention to detail in every piece.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-background rounded-lg p-6 shadow-sm">
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.review}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
