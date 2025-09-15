
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

export function ServiceDescriptionManager({ allServices, allDescriptions }: { allServices: Service[], allDescriptions: string[] }) {
    const [selectedDescription, setSelectedDescription] = useState<string | null>(allDescriptions[0] || null);

    const servicesWithDescription = useMemo(() => {
        if (!selectedDescription) return [];
        return allServices.filter(p => p.description === selectedDescription);
    }, [allServices, selectedDescription]);

    const handleDescriptionChange = (desc: string) => {
        setSelectedDescription(desc);
    };

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
                </div>
                 {selectedDescription && (
                    <div className="flex items-center text-sm text-muted-foreground pt-4">
                        <p><span className="font-semibold text-foreground">{servicesWithDescription.length}</span> servicios con esta descripción.</p>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedDescription && servicesWithDescription.length > 0 ? (
                            servicesWithDescription.map((service) => (
                                <TableRow key={service.id}>
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
                                <TableCell colSpan={3} className="h-48 text-center">
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
