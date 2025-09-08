
'use client';

import { useState } from 'react';
import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
          <p className="font-body text-sm text-muted-foreground italic mb-2">{product.category}</p>
          {product.description && <p className="font-body text-sm text-foreground/80 line-clamp-3">{product.description}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className='font-bold text-lg text-primary'>{formatPrice(product.price)}</span>
        </CardFooter>
      </Card>
  );
}

const allCategories = ['Todas', 'Planta de interior', 'Planta de exterior', 'Planta frutal', 'Planta ornamental', 'Suculenta', 'Herramienta', 'Fertilizante', 'Maceta', 'Plantines'] as const;
type ProductCategory = typeof allCategories[number];

export function ProductCatalog({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Todas');

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'Todas' || product.category === selectedCategory)
  );

  return (
    <div>
       <div className="flex justify-center flex-wrap gap-2 mb-6">
        {allCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="font-headline"
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Busca productos por nombre o categoría..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground font-body">No se encontraron productos. Intenta con otro término de búsqueda o filtro.</p>
      )}
    </div>
  );
}
