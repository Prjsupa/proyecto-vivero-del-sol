
'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Search } from 'lucide-react';
import { updateServicesCategory } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/lib/definitions';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Añadiendo...</> : 'Añadir a la Categoría'}
        </Button>
    )
}

export function AddServicesToCategoryForm({ categoryName, allServices, onActionCompleted }: { categoryName: string, allServices: Service[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateServicesCategory, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
            onActionCompleted();
        } else if (state?.message && state.message !== 'success' && !state.errors) {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast, onActionCompleted]);

    const onDialogChange = (open: boolean) => {
        if (!open) {
            formRef.current?.reset();
            setSelectedServiceIds([]);
            setSearchTerm('');
        }
        setIsDialogOpen(open);
    }
    
    const servicesNotInThisCategory = useMemo(() => {
        return allServices.filter(p => p.category !== categoryName);
    }, [allServices, categoryName]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) return servicesNotInThisCategory;
        return servicesNotInThisCategory.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [servicesNotInThisCategory, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedServiceIds(filteredServices.map(p => p.id));
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

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                 <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Servicios
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Añadir Servicios a la Categoría: <span className='font-bold'>{categoryName}</span></DialogTitle>
                    <DialogDescription>
                       Selecciona los servicios que deseas mover a esta categoría.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                     <input type="hidden" name="serviceIds" value={selectedServiceIds.join(',')} />
                     <input type="hidden" name="category" value={categoryName} />
                    <div>
                        <Label>Servicios</Label>
                        <p className='text-sm text-muted-foreground'>Selecciona los servicios para mover a esta categoría.</p>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar servicios..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <ScrollArea className="h-64 mt-2 border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            onCheckedChange={handleSelectAll}
                                            checked={filteredServices.length > 0 && selectedServiceIds.length === filteredServices.length}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>Servicio</TableHead>
                                    <TableHead>Categoría Actual</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredServices.map(service => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <Checkbox
                                                onCheckedChange={(checked) => handleSelectRow(service.id, !!checked)}
                                                checked={selectedServiceIds.includes(service.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{service.category}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                    <p className="text-sm text-muted-foreground">{selectedServiceIds.length} de {filteredServices.length} servicio(s) seleccionado(s).</p>

                     <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
