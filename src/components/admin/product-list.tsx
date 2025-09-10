
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search } from "lucide-react";
import type { Product } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { ProductActions } from "@/components/admin/product-actions";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProductList({ products, categories }: { products: Product[], categories: string[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [subcategoryFilter, setSubcategoryFilter] = useState('Todas');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('none');

    const productCategories = useMemo(() => {
        return ['Todas', ...categories];
    }, [categories]);
    
    const productSubcategories = useMemo(() => {
        const subcategories = new Set(products.map(p => p.subcategory).filter(Boolean) as string[]);
        return ['Todas', ...Array.from(subcategories).sort()];
    }, [products]);

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (categoryFilter !== 'Todas') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        if (subcategoryFilter !== 'Todas') {
            filtered = filtered.filter(p => p.subcategory === subcategoryFilter);
        }

        if (availabilityFilter !== 'all') {
            const isAvailable = availabilityFilter === 'available';
            filtered = filtered.filter(p => p.available === isAvailable);
        }
        
        if (sortFilter.startsWith('stock')) {
            filtered.sort((a, b) => {
                if (sortFilter === 'stock_asc') {
                    return a.stock - b.stock;
                } else {
                    return b.stock - a.stock;
                }
            });
        } else if (sortFilter.startsWith('price')) {
             filtered.sort((a, b) => {
                if (sortFilter === 'price_asc') {
                    return a.price - b.price;
                } else {
                    return b.price - a.price;
                }
            });
        } else if (sortFilter.startsWith('name')) {
            filtered.sort((a, b) => {
                if (sortFilter === 'name_asc') {
                    return a.name.localeCompare(b.name);
                } else {
                    return b.name.localeCompare(a.name);
                }
            });
        }


        return filtered;
    }, [products, searchTerm, categoryFilter, subcategoryFilter, availabilityFilter, sortFilter]);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por nombre o SKU..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="md:w-[180px]">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {productCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                        <SelectTrigger className="md:w-[180px]">
                            <SelectValue placeholder="Subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {productSubcategories.map(sub => (
                                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                        <SelectTrigger className="md:w-[180px]">
                            <SelectValue placeholder="Disponibilidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="unavailable">No disponible</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={sortFilter} onValueChange={setSortFilter}>
                        <SelectTrigger className="md:w-[220px]">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin orden</SelectItem>
                            <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
                            <SelectItem value="name_desc">Nombre: Z-A</SelectItem>
                            <SelectItem value="stock_asc">Stock: Menor a mayor</SelectItem>
                            <SelectItem value="stock_desc">Stock: Mayor a menor</SelectItem>
                            <SelectItem value="price_asc">Precio: Menor a mayor</SelectItem>
                            <SelectItem value="price_desc">Precio: Mayor a menor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedProducts.length > 0 ? (
                            filteredAndSortedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-xs text-muted-foreground">{product.sku}</div>
                                        <div className="text-sm text-muted-foreground">{product.category}{product.subcategory && ` / ${product.subcategory}`}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.available ? 'default' : 'outline'} className={cn(product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                            {product.available ? 'Disponible' : 'No disponible'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                    <TableCell>
                                        <ProductActions product={product} categories={categories} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Package className="h-12 w-12" />
                                        <p className="font-semibold">No se encontraron productos.</p>
                                        <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
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
