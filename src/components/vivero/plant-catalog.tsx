
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart, Trash2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useCart from '@/hooks/use-cart-store';
import { useToast } from '@/hooks/use-toast';

function QuantityControl({ productId }: { productId: string }) {
    const { items, updateQuantity, removeItem } = useCart();
    const itemInCart = items.find((item) => item.product.id === productId);

    if (!itemInCart) return null;

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity > 0) {
            updateQuantity(productId, newQuantity);
        } else {
            removeItem(productId);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(itemInCart.quantity - 1)}
            >
                {itemInCart.quantity === 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : '-'}
            </Button>
            <Input
                type="number"
                value={itemInCart.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                className="h-8 w-12 text-center"
                min="1"
                max={itemInCart.product.stock}
            />
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(itemInCart.quantity + 1)}
            >
                +
            </Button>
        </div>
    )
}

function PlantCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const itemInCart = items.find((item) => item.product.id === product.id);

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: 'Añadido al carrito',
      description: `${product.name} ha sido añadido a tu carrito.`,
    });
  };

  return (
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-xl duration-300 group">
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
          <p className="font-body text-sm text-muted-foreground italic mb-2">{product.category}</p>
          {product.description && <p className="font-body text-sm text-foreground/80 line-clamp-3">{product.description}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className='font-bold text-lg text-primary'>{formatPrice(product.price)}</span>
          {itemInCart ? (
            <QuantityControl productId={product.id} />
          ) : (
            <Button onClick={handleAddToCart} disabled={!product.available || product.stock === 0} size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Añadir
            </Button>
          )}
        </CardFooter>
      </Card>
  );
}

const plantCategories = ['Todas', 'Planta de interior', 'Planta de exterior', 'Planta frutal', 'Planta ornamental', 'Suculenta'] as const;
type PlantCategory = typeof plantCategories[number];

export function PlantCatalog({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory>('Todas');

  const filteredPlants = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'Todas' || product.category === selectedCategory)
  );

  return (
    <div>
       <div className="flex justify-center flex-wrap gap-2 mb-6">
        {plantCategories.map((category) => (
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
          placeholder="Busca plantas por nombre o categoría..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPlants.map((product) => (
            <PlantCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground font-body">No se encontraron plantas. Intenta con otro término de búsqueda o filtro.</p>
      )}
    </div>
  );
}
