'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

function PlantCard({ product }: { product: Product }) {
  return (
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-xl duration-300">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={product.img_url || 'https://placehold.co/400x300'}
              alt={product.name}
              data-ai-hint="plant"
              fill
              className="object-cover"
            />
             <Badge
              className={cn(
                'absolute top-2 right-2',
                product.available ? 'bg-primary/80' : 'bg-destructive/80'
              )}
            >
              {product.available ? 'En stock' : 'Agotado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="font-headline text-xl mb-1">{product.name}</h3>
          <p className="font-body text-sm text-muted-foreground italic">{product.category}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className='font-bold text-lg text-primary'>${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
        </CardFooter>
      </Card>
  );
}

export function PlantCatalog({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-8 max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search plants by name or species..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlants.map((product) => (
            <PlantCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground font-body">No plants found. Try a different search term.</p>
      )}
    </div>
  );
}
