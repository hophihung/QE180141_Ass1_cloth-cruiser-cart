import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 12;

type ProductsApiResponse = {
  success?: boolean;
  data?: Product[];
  meta?: {
    total?: number;
    limit?: number | null;
    page?: number;
    returned?: number;
  };
  message?: string;
};

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const { toast } = useToast();
  const { token } = useAuth();

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    image: ''
  });

  // Fetch products from backend API
  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', PAGE_SIZE.toString());
        params.set('sort', 'createdAt:desc');

        const response = (await apiFetch(`/api/products?${params.toString()}`, {
          raw: true,
        })) as ProductsApiResponse | null;

        const data = Array.isArray(response?.data) ? response?.data ?? [] : [];
        const meta = response?.meta;
        const totalItems = typeof meta?.total === 'number' ? meta.total : data.length;
        const limit = typeof meta?.limit === 'number' && meta.limit > 0 ? meta.limit : PAGE_SIZE;
        const computedTotalPages = Math.max(1, Math.ceil(totalItems / limit));

        if (page > computedTotalPages && computedTotalPages > 0) {
          setPage(computedTotalPages);
          return;
        }

        setProducts(data);
        setTotal(totalItems);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
        toast({
          title: "Error",
          description: err.message || 'Failed to load products',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, token, refreshIndex, toast]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      inStock: true,
      image: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? product.price.toString() : '0',
      category: product.category || '',
      inStock: product.inStock !== false,
      image: product.image || ''
    });
    setIsDialogOpen(true);
  };

  // handleDelete
  const handleDelete = async (productId: string) => {
    if (!productId) {
      toast({ title: "Error", description: "Invalid product ID", variant: "destructive" });
      return;
    }
    try {
      await apiFetch(`/api/products/${productId}`, { method: 'DELETE' });
      setProducts(products.filter(p => (p._id || p.id) !== productId));
      setRefreshIndex(prev => prev + 1);
      toast({ title: "Product deleted", description: "The product has been removed successfully." });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      toast({ title: "Error", description: err.message || "Failed to delete product.", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        inStock: formData.inStock,
        image: formData.image || undefined,
      };

      if (editingProduct) {
        const productId = editingProduct._id || editingProduct.id;
        if (!productId) throw new Error('Product ID is missing');
        const updatedProduct = await apiFetch(`/api/products/${productId}`, {
          method: 'PUT',
          json: productData,
        });
        setProducts(products.map(p => (p._id || p.id) === productId ? updatedProduct : p));
        toast({ title: "Product updated", description: "The product has been updated successfully." });
        setRefreshIndex(prev => prev + 1);
      } else {
        const newProduct = await apiFetch('/api/products', {
          method: 'POST',
          json: productData,
        });
        setProducts([...products, newProduct]);
        setPage(1);
        setRefreshIndex(prev => prev + 1);
        toast({ title: "Product created", description: "The new product has been added successfully." });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error submitting product:', err);
      toast({ title: "Error", description: err.message || "Failed to save product.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Product Management</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter product description"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                      <SelectItem value="Jackets">Jackets</SelectItem>
                      <SelectItem value="Dresses">Dresses</SelectItem>
                      <SelectItem value="Hoodies">Hoodies</SelectItem>
                      <SelectItem value="Pants">Pants</SelectItem>
                      <SelectItem value="Shorts">Shorts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inStock">Stock Status</Label>
                  <Select value={formData.inStock.toString()} onValueChange={(value) => setFormData({...formData, inStock: value === 'true'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">In Stock</SelectItem>
                      <SelectItem value="false">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : (editingProduct ? 'Update' : 'Create')} Product
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock (Page)</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.filter(p => p.inStock !== false).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock (Page)</CardTitle>
              <Package className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.filter(p => p.inStock === false).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && !error && (
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>
                  Showing {rangeStart}-{rangeEnd} of {total} products
                </span>
                <span>Page {page} of {totalPages}</span>
              </div>
            )}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-destructive font-medium">{error}</p>
                <Button variant="outline" onClick={() => setRefreshIndex(prev => prev + 1)}>Try again</Button>
              </div>
            ) : products.length ? (
              <>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product._id || product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}

                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold">${product.price}</span>
                            {product.category && (
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                            <Badge variant={product.inStock !== false ? "default" : "destructive"} className="text-xs">
                              {product.inStock !== false ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id || product.id || '')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage((prev) => Math.max(1, prev - 1));
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === page}
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(pageNumber);
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage((prev) => Math.min(totalPages, prev + 1));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-muted-foreground">No products found.</p>
                <Button variant="outline" onClick={() => setRefreshIndex(prev => prev + 1)}>Refresh</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;