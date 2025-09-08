
'use client';
import { useState, useMemo } from 'react';
import type { Product } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { BatchActions } from './batch-actions';

export function CategoryProductManager({ allProducts, allCategories }: { allProducts: Product[], allCategories: string[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(allCategories[0] || null);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const productsInCategory = useMemo(() => {
        if (!selectedCategory) return [];
        return allProducts.filter(p => p.category === selectedCategory);
    }, [allProducts, selectedCategory]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedProductIds([]); // Reset selection when category changes
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProductIds(productsInCategory.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectRow = (productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProductIds(prev => [...prev, productId]);
        } else {
            setSelectedProductIds(prev => prev.filter(id => id !== productId));
        }
    };

    const onActionCompleted = () => {
        setSelectedProductIds([]);
        // Note: we would need to re-fetch data or manually update the state
        // For simplicity, we can reload, but a better UX would be to update state.
        window.location.reload(); 
    }

    return (
        <Card>
             <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className='w-full md:w-72'>
                         <Select onValueChange={handleCategoryChange} value={selectedCategory || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCategory && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <p><span className="font-semibold text-foreground">{productsInCategory.length}</span> productos en esta categoría.</p>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {selectedProductIds.length > 0 && (
                    <div className="mb-4">
                        <BatchActions selectedProductIds={selectedProductIds} onActionCompleted={onActionCompleted} />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={selectedProductIds.length > 0 && selectedProductIds.length === productsInCategory.length}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedCategory && productsInCategory.length > 0 ? (
                            productsInCategory.map((product) => (
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
                                        {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Package className="h-12 w-12" />
                                        <p className="font-semibold">{selectedCategory ? 'No se encontraron productos en esta categoría.' : 'Por favor, selecciona una categoría para empezar.'}</p>
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
