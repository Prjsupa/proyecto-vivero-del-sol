
'use client';
import { useState, useMemo } from 'react';
import type { Quote, Client } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { ClipboardList, Search } from 'lucide-react';

export function QuotesList({ quotes, clients }: { quotes: Quote[], clients: Client[] }) {
    const router = useRouter();
    const [filters, setFilters] = useState({
        clientName: '',
        contentType: 'todos',
        sortBy: 'date_desc',
    });

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredAndSortedQuotes = useMemo(() => {
        let filtered = [...quotes];

        // Filter by client name
        if (filters.clientName) {
            filtered = filtered.filter(q => q.client_name.toLowerCase().includes(filters.clientName.toLowerCase()));
        }

        // Filter by content type
        if (filters.contentType === 'products_only') {
            filtered = filtered.filter(q => Array.isArray(q.items) && q.items.length > 0 && (!Array.isArray(q.resources) || q.resources.length === 0));
        } else if (filters.contentType === 'services_only') {
            filtered = filtered.filter(q => Array.isArray(q.resources) && q.resources.length > 0 && (!Array.isArray(q.items) || q.items.length === 0));
        }

        // Sort
        switch (filters.sortBy) {
            case 'total_asc':
                filtered.sort((a, b) => a.total_amount - b.total_amount);
                break;
            case 'total_desc':
                filtered.sort((a, b) => b.total_amount - a.total_amount);
                break;
            case 'date_desc':
            default:
                // Already sorted by date desc from the query
                break;
        }

        return filtered;
    }, [quotes, filters]);

    const handleRowClick = (quoteId: string) => {
        router.push(`/admin/quotes/${quoteId}`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente..."
                            className="pl-10"
                            value={filters.clientName}
                            onChange={e => handleFilterChange('clientName', e.target.value)}
                        />
                    </div>
                    <Select value={filters.contentType} onValueChange={val => handleFilterChange('contentType', val)}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por contenido..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="products_only">Solo Productos</SelectItem>
                            <SelectItem value="services_only">Solo Servicios/Recursos</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.sortBy} onValueChange={val => handleFilterChange('sortBy', val)}>
                        <SelectTrigger><SelectValue placeholder="Ordenar por..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="date_desc">Más Recientes</SelectItem>
                            <SelectItem value="total_asc">Total: Menor a Mayor</SelectItem>
                            <SelectItem value="total_desc">Total: Mayor a Menor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="hidden md:table-cell">Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedQuotes.length > 0 ? (
                            filteredAndSortedQuotes.map(quote => (
                                <TableRow key={quote.id} onClick={() => handleRowClick(quote.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{quote.title}</TableCell>
                                    <TableCell>{quote.client_name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{format(new Date(quote.created_at), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell><Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>{quote.status}</Badge></TableCell>
                                    <TableCell className="text-right font-mono">{formatPrice(quote.total_amount, quote.currency)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <ClipboardList className="h-12 w-12" />
                                        <p className="font-semibold">No se encontraron presupuestos.</p>
                                        <p className="text-sm">Intenta ajustar los filtros o crea un nuevo presupuesto.</p>
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
