import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.jpg';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBanner}
          alt="Fashion Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Fashion Forward
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
          Discover the latest trends and timeless classics. Elevate your style with our curated collection of premium fashion.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link to="/products" className="gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
            <Link to="/products">
              Browse Collections
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;