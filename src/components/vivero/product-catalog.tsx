
'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function ProductCard({ product }: { product: Product }) {
  return (
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-xl duration-300 group">
        <CardContent className="p-4 flex-grow relative">
           <Badge
              className={cn(
                'absolute top-4 right-4',
                product.available ? 'bg-primary/80 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
              )}
            >
              {product.available ? 'En stock' : 'Agotado'}
            </Badge>
          <h3 className="font-headline text-xl mb-1 pt-8">{product.name}</h3>
           <p className="font-body text-sm text-muted-foreground italic mb-2">
            {product.category}
            {product.subcategory && ` / ${product.subcategory}`}
          </p>
          {product.description && <p className="font-body text-sm text-foreground/80 line-clamp-3">{product.description}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className='font-bold text-lg text-primary'>{formatPrice(product.precio_venta)}</span>
        </CardFooter>
      </Card>
  );
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todas');
  const [priceSort, setPriceSort] = useState('none');

  const allCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return ['Todas', ...Array.from(categories).sort()];
  }, [products]);
  
  const availableSubcategories = useMemo(() => {
    const subcategories = new Set(
        products
            .filter(p => selectedCategory === 'Todas' || p.category === selectedCategory)
            .map(p => p.subcategory)
            .filter(Boolean) as string[]
    );
    return ['Todas', ...Array.from(subcategories).sort()];
  }, [products, selectedCategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
        filtered = filtered.filter(
            (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (selectedCategory !== 'Todas') {
        filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSubcategory !== 'Todas') {
        filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }
    
    if (priceSort !== 'none') {
        filtered.sort((a, b) => {
            if (priceSort === 'asc') {
                return a.precio_venta - b.precio_venta;
            } else {
                return b.precio_venta - a.precio_venta;
            }
        });
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedSubcategory, priceSort]);
  
  const handleCategoryChange = (category: string) => {
      setSelectedCategory(category);
      setSelectedSubcategory('Todas'); // Reset subcategory when category changes
  }

  return (
    <div>
       <div className="flex justify-center flex-wrap gap-2 mb-6">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => handleCategoryChange(category)}
            className="font-headline"
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            type="text"
            placeholder="Busca productos por nombre o categoría..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="w-full md:w-auto">
             <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory} disabled={availableSubcategories.length <= 1}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Subcategoría" />
                </SelectTrigger>
                <SelectContent>
                   {availableSubcategories.map(sub => (
                     <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                   ))}
                </SelectContent>
            </Select>
        </div>
        <div className="w-full md:w-auto">
             <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Ordenar por precio" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Sin orden</SelectItem>
                    <SelectItem value="asc">Precio: Menor a mayor</SelectItem>
                    <SelectItem value="desc">Precio: Mayor a menor</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground font-body">No se encontraron productos. Intenta con otro término de búsqueda o filtro.</p>
      )}
    </div>
  );
}
