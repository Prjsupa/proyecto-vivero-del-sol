
'use client';
import { useState, useMemo } from 'react';
import type { Product } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Palette } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ColorBatchActions } from './color-batch-actions';
import { EditColorForm } from './edit-color-form';
import { DeleteColorAlert } from './delete-color-alert';
import { AddProductsToColorForm } from './add-products-to-color-form';

export function ColorManager({ allProducts, allColors }: { allProducts: Product[], allColors: string[] }) {
    const [selectedColor, setSelectedColor] = useState<string | null>(allColors[0] || null);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const productsWithColor = useMemo(() => {
        if (!selectedColor) return [];
        return allProducts.filter(p => p.color === selectedColor);
    }, [allProducts, selectedColor]);

    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        setSelectedProductIds([]);
    };
    
    const handleSelectAll = (checked: boolean) => {
        setSelectedProductIds(checked ? productsWithColor.map(p => p.id) : []);
    };

    const handleSelectRow = (productId: string, checked: boolean) => {
        setSelectedProductIds(prev => checked ? [...prev, productId] : prev.filter(id => id !== productId));
    };

    const onActionCompleted = () => {
        setSelectedProductIds([]);
        window.location.reload(); 
    }

    const onColorActionCompleted = () => {
        setSelectedColor(null);
        window.location.reload();
    }


    return (
        <Card>
             <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className='w-full md:w-72'>
                         <Select onValueChange={handleColorChange} value={selectedColor || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un color" />
                            </SelectTrigger>
                            <SelectContent>
                                {allColors.map(color => (
                                    <SelectItem key={color} value={color}>{color}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedColor && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <AddProductsToColorForm
                                colorName={selectedColor}
                                allProducts={allProducts}
                                onActionCompleted={onActionCompleted}
                            />
                             <EditColorForm
                                colorName={selectedColor}
                                onColorUpdated={onColorActionCompleted}
                            />
                            <DeleteColorAlert
                                colorName={selectedColor}
                                productCount={productsWithColor.length}
                                onColorDeleted={onColorActionCompleted}
                            />
                        </div>
                    )}
                </div>
                 {selectedColor && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{productsWithColor.length}</span> productos con este color.</p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                 {selectedProductIds.length > 0 && (
                    <div className="mb-4">
                        <ColorBatchActions 
                            selectedProductIds={selectedProductIds}
                            onActionCompleted={onActionCompleted}
                        />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                             <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={productsWithColor.length > 0 && selectedProductIds.length === productsWithColor.length}
                                    aria-label="Select all"
                                    disabled={productsWithColor.length === 0}
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedColor && productsWithColor.length > 0 ? (
                            productsWithColor.map((product) => (
                                <TableRow key={product.id} data-state={selectedProductIds.includes(product.id) && "selected"}>
                                    <TableCell>
                                         <Checkbox
                                            onCheckedChange={(checked) => handleSelectRow(product.id, !!checked)}
                                            checked={selectedProductIds.includes(product.id)}
                                            aria-label={`Select product ${product.name}`}
                                        />
                                    </TableCell>
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
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Palette className="h-12 w-12" />
                                        <p className="font-semibold">{selectedColor ? 'No se encontraron productos con este color.' : 'Por favor, selecciona un color para empezar.'}</p>
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
