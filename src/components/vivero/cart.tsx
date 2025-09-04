
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import useCart from '@/hooks/use-cart-store';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { handleCheckout } from '@/lib/actions';
import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Cart() {
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(async (previousState: any, formData: FormData) => {
    const result = await handleCheckout(cart.items);
    if (result.success) {
      toast({
        title: '¡Compra exitosa!',
        description: 'Tu pedido ha sido procesado.',
      });
      cart.clearCart();
      setIsSheetOpen(false);
      router.refresh();
    } else {
      toast({
        title: 'Error en la compra',
        description: result.message,
        variant: 'destructive',
      });
    }
    return result;
  }, null);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Open Cart</span>
          {cart.totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {cart.totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Carrito de Compras ({cart.totalItems})</SheetTitle>
        </SheetHeader>
        {cart.totalItems > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="flex flex-col gap-4 py-4">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md">
                       <Image
                        src={item.product.img_url || 'https://placehold.co/100'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => cart.updateQuantity(item.product.id, parseInt(e.target.value))}
                          className="h-7 w-12 text-center"
                          min="1"
                          max={item.product.stock}
                        />
                         <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                     <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mt-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => cart.removeItem(item.product.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="bg-muted p-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
                 <form action={formAction}>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Procesando...' : 'Comprar Ahora'}
                    </Button>
                </form>
                <Button variant="outline" className="w-full" onClick={cart.clearCart}>
                  Vaciar Carrito
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-20 w-20 text-muted-foreground" />
            <h3 className="font-semibold">Tu carrito está vacío</h3>
            <p className="text-sm text-muted-foreground">¡Añade productos para empezar a comprar!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
