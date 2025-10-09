import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types/product';
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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['all']);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Fetch products from backend API
  useEffect(() => {
    setPage(1);
  }, [sortBy, filterCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', PAGE_SIZE.toString());

        switch (sortBy) {
          case 'price-low':
            params.set('sort', 'price:asc');
            break;
          case 'price-high':
            params.set('sort', 'price:desc');
            break;
          case 'name':
          default:
            params.set('sort', 'name:asc');
            break;
        }

        if (filterCategory !== 'all') {
          params.set('category', filterCategory);
        }

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

        const newCategories = new Set<string>(['all']);
        if (filterCategory !== 'all') {
          newCategories.add(filterCategory);
        }
        data.forEach(product => {
          if (product.category) {
            newCategories.add(product.category);
          }
        });
        const sortedCategories = Array.from(newCategories)
          .filter(Boolean)
          .map(category => category);
        const others = sortedCategories.filter(category => category !== 'all').sort();
        setCategoryOptions(['all', ...others]);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch products');
        console.error('Error fetching products:', err);
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, sortBy, filterCategory, refreshIndex]);

  const totalPages = useMemo(() => {
    if (!total) return 1;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [total]);

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleRetry = () => {
    setRefreshIndex(prev => prev + 1);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of premium fashion items
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
            <Select value={filterCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sort:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">{total} products found</span>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">Error: {error}</p>
            <Button
              variant="outline"
              onClick={handleRetry}
            >
              Retry
            </Button>
          </div>
        ) : products.length ? (
          <>
            <ProductGrid products={products} />
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
                      onClick={event => {
                        event.preventDefault();
                        setPage(prev => Math.max(1, prev - 1));
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
                          onClick={event => {
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
                      className={page === totalPages ? 'pointer-events-none opacity-50' : undefined}
                      onClick={event => {
                        event.preventDefault();
                        setPage(prev => Math.min(totalPages, prev + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              No products found matching your criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilterCategory('all');
                setSortBy('name');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;