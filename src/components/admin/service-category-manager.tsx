
'use client';
import { useState, useMemo } from 'react';
import type { Service } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConciergeBell } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { EditServiceCategoryForm } from './edit-service-category-form';
import { DeleteServiceCategoryAlert } from './delete-service-category-alert';
import { AddServicesToCategoryForm } from './add-services-to-category-form';
import { ServiceCategoryBatchActions } from './service-category-batch-actions';

export function ServiceCategoryManager({ allServices, allCategories }: { allServices: Service[], allCategories: string[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(allCategories[0] || null);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

    const servicesInCategory = useMemo(() => {
        if (!selectedCategory) return [];
        return allServices.filter(p => p.category === selectedCategory);
    }, [allServices, selectedCategory]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setSelectedServiceIds([]); // Reset selection when category changes
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedServiceIds(servicesInCategory.map(p => p.id));
        } else {
            setSelectedServiceIds([]);
        }
    };

    const handleSelectRow = (serviceId: string, checked: boolean) => {
        if (checked) {
            setSelectedServiceIds(prev => [...prev, serviceId]);
        } else {
            setSelectedServiceIds(prev => prev.filter(id => id !== serviceId));
        }
    };

    const onActionCompleted = () => {
        setSelectedServiceIds([]);
        window.location.reload(); 
    }

    const onCategoryActionCompleted = () => {
        setSelectedCategory(null);
        window.location.reload();
    }


    return (
        <Card>
             <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start">
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
                        <div className="flex items-center gap-2 flex-wrap">
                            <AddServicesToCategoryForm 
                                categoryName={selectedCategory} 
                                allServices={allServices} 
                                onActionCompleted={onActionCompleted}
                            />
                            <EditServiceCategoryForm 
                                categoryName={selectedCategory} 
                                onCategoryUpdated={onCategoryActionCompleted}
                            />
                            <DeleteServiceCategoryAlert 
                                categoryName={selectedCategory}
                                serviceCount={servicesInCategory.length}
                                onCategoryDeleted={onActionCompleted}
                            />
                        </div>
                    )}
                </div>
                 {selectedCategory && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{servicesInCategory.length}</span> servicios en esta categoría.</p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedServiceIds.length > 0 && (
                    <div className="mb-4">
                        <ServiceCategoryBatchActions 
                            selectedServiceIds={selectedServiceIds} 
                            allCategories={allCategories}
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
                                    checked={servicesInCategory.length > 0 && selectedServiceIds.length === servicesInCategory.length}
                                    aria-label="Select all"
                                    disabled={servicesInCategory.length === 0}
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedCategory && servicesInCategory.length > 0 ? (
                            servicesInCategory.map((service) => (
                                <TableRow key={service.id} data-state={selectedServiceIds.includes(service.id) && "selected"}>
                                    <TableCell>
                                         <Checkbox
                                            onCheckedChange={(checked) => handleSelectRow(service.id, !!checked)}
                                            checked={selectedServiceIds.includes(service.id)}
                                            aria-label={`Select service ${service.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={service.available ? 'default' : 'outline'} className={cn(service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                            {service.available ? 'Disponible' : 'No disponible'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {formatPrice(service.precio_venta)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <ConciergeBell className="h-12 w-12" />
                                        <p className="font-semibold">{selectedCategory ? 'No se encontraron servicios en esta categoría.' : 'Por favor, selecciona una categoría para empezar.'}</p>
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
