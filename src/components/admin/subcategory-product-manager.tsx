
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
import { SubcategoryBatchActions } from './subcategory-batch-actions';
import { EditSubcategoryForm } from './edit-subcategory-form';
import { DeleteSubcategoryAlert } from './delete-subcategory-alert';
import { AddProductsToSubcategoryForm } from './add-products-to-subcategory-form';

export function SubcategoryProductManager({ allProducts, allSubcategories }: { allProducts: Product[], allSubcategories: string[] }) {
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(allSubcategories[0] || null);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const productsInSubcategory = useMemo(() => {
        if (!selectedSubcategory) return [];
        return allProducts.filter(p => p.subcategory === selectedSubcategory);
    }, [allProducts, selectedSubcategory]);

    const handleSubcategoryChange = (subcategory: string) => {
        setSelectedSubcategory(subcategory);
        setSelectedProductIds([]); // Reset selection when subcategory changes
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProductIds(productsInSubcategory.map(p => p.id));
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
        window.location.reload(); 
    }

    const onSubcategoryActionCompleted = () => {
        setSelectedSubcategory(null);
        window.location.reload();
    }


    return (
        <Card>
             <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className='w-full md:w-72'>
                         <Select onValueChange={handleSubcategoryChange} value={selectedSubcategory || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una subcategoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {allSubcategories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     {selectedSubcategory && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <AddProductsToSubcategoryForm 
                                subcategoryName={selectedSubcategory}
                                allProducts={allProducts}
                                onActionCompleted={onActionCompleted}
                            />
                            <EditSubcategoryForm
                                subcategoryName={selectedSubcategory}
                                onSubcategoryUpdated={onSubcategoryActionCompleted}
                            />
                            <DeleteSubcategoryAlert
                                subcategoryName={selectedSubcategory}
                                productCount={productsInSubcategory.length}
                                onSubcategoryDeleted={onSubcategoryActionCompleted}
                            />
                        </div>
                    )}
                </div>
                 {selectedSubcategory && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{productsInSubcategory.length}</span> productos en esta subcategoría.</p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedProductIds.length > 0 && (
                    <div className="mb-4">
                        <SubcategoryBatchActions 
                            selectedProductIds={selectedProductIds} 
                            onActionCompleted={onActionCompleted} 
                            allSubcategories={allSubcategories}
                        />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={productsInSubcategory.length > 0 && selectedProductIds.length === productsInSubcategory.length}
                                    aria-label="Select all"
                                    disabled={productsInSubcategory.length === 0}
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedSubcategory && productsInSubcategory.length > 0 ? (
                            productsInSubcategory.map((product) => (
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
                                        <Package className="h-12 w-12" />
                                        <p className="font-semibold">{selectedSubcategory ? 'No se encontraron productos en esta subcategoría.' : 'Por favor, selecciona una subcategoría para empezar.'}</p>
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
