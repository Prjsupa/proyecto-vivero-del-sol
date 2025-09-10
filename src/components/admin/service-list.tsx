
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, Search } from "lucide-react";
import type { Service } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { ServiceActions } from "@/components/admin/service-actions";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ServiceList({ services, categories }: { services: Service[], categories: string[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('none');

    const serviceCategories = useMemo(() => {
        return ['Todas', ...categories];
    }, [categories]);
    

    const filteredAndSortedServices = useMemo(() => {
        let filtered = [...services];

        if (searchTerm) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.sku && s.sku.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (categoryFilter !== 'Todas') {
            filtered = filtered.filter(s => s.category === categoryFilter);
        }

        if (availabilityFilter !== 'all') {
            const isAvailable = availabilityFilter === 'available';
            filtered = filtered.filter(s => s.available === isAvailable);
        }
        
        if (sortFilter.startsWith('price')) {
             filtered.sort((a, b) => {
                if (sortFilter === 'price_asc') {
                    return a.precio_venta - b.precio_venta;
                } else {
                    return b.precio_venta - a.precio_venta;
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
    }, [services, searchTerm, categoryFilter, availabilityFilter, sortFilter]);

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
                            {serviceCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                            <SelectItem value="price_asc">Precio Venta: Menor a mayor</SelectItem>
                            <SelectItem value="price_desc">Precio Venta: Mayor a menor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedServices.length > 0 ? (
                            filteredAndSortedServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-xs text-muted-foreground">{service.sku}</div>
                                        <div className="text-sm text-muted-foreground">{service.category}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={service.available ? 'default' : 'outline'} className={cn(service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                            {service.available ? 'Disponible' : 'No disponible'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div>{formatPrice(service.precio_venta)}</div>
                                    </TableCell>
                                    <TableCell>
                                        <ServiceActions service={service} categories={categories} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Wrench className="h-12 w-12" />
                                        <p className="font-semibold">No se encontraron servicios.</p>
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
