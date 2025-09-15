
'use client';
import { useState, useMemo } from 'react';
import type { Service } from "@/lib/definitions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { AddServicesToDescriptionForm } from './add-services-to-description-form';
import { EditServiceDescriptionForm } from './edit-service-description-form';
import { DeleteServiceDescriptionAlert } from './delete-service-description-alert';
import { ServiceDescriptionBatchActions } from './service-description-batch-actions';

export function ServiceDescriptionManager({ allServices, allDescriptions }: { allServices: Service[], allDescriptions: string[] }) {
    const [selectedDescription, setSelectedDescription] = useState<string | null>(allDescriptions[0] || null);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

    const servicesWithDescription = useMemo(() => {
        if (!selectedDescription) return [];
        return allServices.filter(s => s.description === selectedDescription);
    }, [allServices, selectedDescription]);

    const handleDescriptionChange = (desc: string) => {
        setSelectedDescription(desc);
        setSelectedServiceIds([]);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedServiceIds(checked ? servicesWithDescription.map(s => s.id) : []);
    };

    const handleSelectRow = (serviceId: string, checked: boolean) => {
        setSelectedServiceIds(prev => checked ? [...prev, serviceId] : prev.filter(id => id !== serviceId));
    };

    const onActionCompleted = () => {
        setSelectedServiceIds([]);
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
                            <AddServicesToDescriptionForm
                                description={selectedDescription}
                                allServices={allServices}
                                onActionCompleted={onActionCompleted}
                            />
                             <EditServiceDescriptionForm
                                description={selectedDescription}
                                onDescriptionUpdated={onDescriptionActionCompleted}
                            />
                            <DeleteServiceDescriptionAlert
                                description={selectedDescription}
                                serviceCount={servicesWithDescription.length}
                                onDescriptionDeleted={onDescriptionActionCompleted}
                            />
                        </div>
                    )}
                </div>
                 {selectedDescription && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{servicesWithDescription.length}</span> servicios con esta descripción.</p>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedServiceIds.length > 0 && (
                    <div className="mb-4">
                        <ServiceDescriptionBatchActions
                            selectedServiceIds={selectedServiceIds}
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
                                    checked={servicesWithDescription.length > 0 && selectedServiceIds.length === servicesWithDescription.length}
                                    aria-label="Select all"
                                    disabled={servicesWithDescription.length === 0}
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedDescription && servicesWithDescription.length > 0 ? (
                            servicesWithDescription.map((service) => (
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
                                        <FileText className="h-12 w-12" />
                                        <p className="font-semibold">{selectedDescription ? 'No se encontraron servicios con esta descripción.' : 'Por favor, selecciona una descripción para empezar.'}</p>
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
