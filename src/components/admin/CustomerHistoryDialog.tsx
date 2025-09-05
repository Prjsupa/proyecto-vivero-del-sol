
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getCustomerOrders } from '@/lib/actions';
import type { Order, Profile } from '@/lib/definitions';
import { Loader2, PackageOpen, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export function CustomerHistoryDialog({ customer }: { customer: Profile }) {
    const [isOpen, setIsOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        if (!customer.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getCustomerOrders(customer.id);
            if (result.success) {
                setOrders(result.data || []);
            } else {
                setError(result.message);
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open && orders.length === 0) {
            fetchHistory();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                 <button className="w-full text-left flex items-center">
                    <History className="mr-2 h-4 w-4" /> Ver Actividad
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Historial de Cliente</DialogTitle>
                    <DialogDescription>
                        Viendo el historial de pedidos de {customer.name} {customer.last_name}.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                <div className="py-4 pr-6">
                    {isLoading && (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {!isLoading && !error && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="border p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="font-semibold">Pedido #{order.id.substring(0, 8)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(parseISO(order.created_at), 'dd MMM, yyyy HH:mm')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                             <p className="font-bold text-lg">{formatPrice(order.total_amount)}</p>
                                             <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Artículos:</h4>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                           {Array.isArray(order.order_details) && order.order_details.map((detail: any, index: number) => (
                                                <li key={index}>
                                                    {detail.quantity} x (ID: {detail.product_id.substring(0,8)}) - {formatPrice(detail.price_at_purchase)} c/u
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                     {!isLoading && !error && orders.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                            <PackageOpen className="h-12 w-12 mb-2" />
                            <p className="font-semibold">No se encontraron pedidos.</p>
                            <p>Este cliente aún no ha realizado ninguna compra.</p>
                        </div>
                    )}
                </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
