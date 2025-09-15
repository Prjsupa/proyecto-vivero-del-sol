
'use client';
import { useState, useMemo } from 'react';
import type { Product } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { AddProductsToDescriptionForm } from './add-products-to-description-form';
import { EditProductDescriptionForm } from './edit-product-description-form';
import { DeleteProductDescriptionAlert } from './delete-product-description-alert';
import { ProductDescriptionBatchActions } from './product-description-batch-actions';


export function ProductDescriptionManager({ allProducts, allDescriptions }: { allProducts: Product[], allDescriptions: string[] }) {
    const [selectedDescription, setSelectedDescription] = useState<string | null>(allDescriptions[0] || null);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const productsWithDescription = useMemo(() => {
        if (!selectedDescription) return [];
        return allProducts.filter(p => p.description === selectedDescription);
    }, [allProducts, selectedDescription]);

    const handleDescriptionChange = (desc: string) => {
        setSelectedDescription(desc);
        setSelectedProductIds([]);
    };
    
    const handleSelectAll = (checked: boolean) => {
        setSelectedProductIds(checked ? productsWithDescription.map(p => p.id) : []);
    };

    const handleSelectRow = (productId: string, checked: boolean) => {
        setSelectedProductIds(prev => checked ? [...prev, productId] : prev.filter(id => id !== productId));
    };

    const onActionCompleted = () => {
        setSelectedProductIds([]);
        window.location.reload(); 
    }
    
    const onDescriptionActionCompleted = () => {
        setSelectedDescription(null);
        window.location.reload();
    }

    return (
        <Card>
             <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className='w-full md:w-96'>
                         <Select onValueChange={handleDescriptionChange} value={selectedDescription || ''}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una descripción" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-72">
                                {allDescriptions.map(desc => (
                                    <SelectItem key={desc} value={desc}>
                                        <span className="line-clamp-2">{desc}</span>
                                    </SelectItem>
                                ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                     {selectedDescription && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <AddProductsToDescriptionForm
                                description={selectedDescription}
                                allProducts={allProducts}
                                onActionCompleted={onActionCompleted}
                            />
                             <EditProductDescriptionForm
                                description={selectedDescription}
                                onDescriptionUpdated={onDescriptionActionCompleted}
                            />
                            <DeleteProductDescriptionAlert
                                description={selectedDescription}
                                productCount={productsWithDescription.length}
                                onDescriptionDeleted={onDescriptionActionCompleted}
                            />
                        </div>
                    )}
                </div>
                 {selectedDescription && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{productsWithDescription.length}</span> productos con esta descripción.</p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                 {selectedProductIds.length > 0 && (
                    <div className="mb-4">
                        <ProductDescriptionBatchActions
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
                                    checked={productsWithDescription.length > 0 && selectedProductIds.length === productsWithDescription.length}
                                    aria-label="Select all"
                                    disabled={productsWithDescription.length === 0}
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedDescription && productsWithDescription.length > 0 ? (
                            productsWithDescription.map((product) => (
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
                                        <FileText className="h-12 w-12" />
                                        <p className="font-semibold">{selectedDescription ? 'No se encontraron productos con esta descripción.' : 'Por favor, selecciona una descripción para empezar.'}</p>
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
