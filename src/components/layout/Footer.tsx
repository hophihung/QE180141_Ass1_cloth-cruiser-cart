import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-muted mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">StyleShop</h3>
            <p className="text-muted-foreground">
              Your destination for premium fashion and style. Discover the latest trends and timeless classics.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold">Categories</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-accent transition-colors">T-Shirts</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Jackets</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Dresses</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold">Newsletter</h4>
            <p className="text-muted-foreground text-sm">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <Input placeholder="Your email" className="flex-1" />
              <Button size="icon">
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 StyleShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;