import { ShoppingBag, User, Search, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Signed out', description: 'You have been logged out successfully.' });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}



          
          <Link to="/" className="text-2xl font-bold text-primary">
            StyleShop
          </Link>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-foreground hover:text-accent transition-colors">
              Products
            </Link>
            {user && (
              <Link to="/admin" className="text-foreground hover:text-accent transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center gap-2 pr-2 border-r">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground max-w-[180px] truncate">
                  {user.email}
                </span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 pr-2 border-r">
                <Button variant="ghost" asChild size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}

            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleLogout}
                disabled={loading}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => navigate('/login')}
              >
                <User className="w-5 h-5" />
              </Button>
            )}

            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
              >
                0
              </Badge>
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;