
'use client';
import { useState, useMemo } from 'react';
import type { Product } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ruler } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';

export function SizeManager({ allProducts, allSizes }: { allProducts: Product[], allSizes: string[] }) {
    const [selectedSize, setSelectedSize] = useState<string | null>(allSizes[0] || null);

    const productsWithSize = useMemo(() => {
        if (!selectedSize) return [];
        return allProducts.filter(p => p.tamaño === selectedSize);
    }, [allProducts, selectedSize]);

    const handleSizeChange = (size: string) => {
        setSelectedSize(size);
    };

    return (
        <Card>
             <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className='w-full md:w-72'>
                         <Select onValueChange={handleSizeChange} value={selectedSize || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tamaño" />
                            </SelectTrigger>
                            <SelectContent>
                                {allSizes.map(size => (
                                    <SelectItem key={size} value={size}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 {selectedSize && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{productsWithSize.length}</span> productos con este tamaño.</p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedSize && productsWithSize.length > 0 ? (
                            productsWithSize.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.available ? 'default' : 'outline'} className={cn(product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                            {product.available ? 'Disponible' : 'No disponible'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {formatPrice(product.precio_venta)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Ruler className="h-12 w-12" />
                                        <p className="font-semibold">{selectedSize ? 'No se encontraron productos con este tamaño.' : 'Por favor, selecciona un tamaño para empezar.'}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
