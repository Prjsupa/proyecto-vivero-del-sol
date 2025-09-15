
'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Search } from 'lucide-react';
import { updateServicesDescription } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/lib/definitions';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Asignando...</> : 'Asignar a Descripción'}
        </Button>
    )
}

export function AddServicesToDescriptionForm({ description, allServices, onActionCompleted }: { description: string, allServices: Service[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateServicesDescription, { message: '' });
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
    
    const servicesWithoutThisDescription = useMemo(() => {
        return allServices.filter(s => s.description !== description);
    }, [allServices, description]);

    const filteredServices = useMemo(() => {
        if (!searchTerm) return servicesWithoutThisDescription;
        return servicesWithoutThisDescription.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [servicesWithoutThisDescription, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedServiceIds(filteredServices.map(s => s.id));
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
                    <DialogTitle>Asignar Descripción a Servicios</DialogTitle>
                    <DialogDescription>
                        Selecciona los servicios a los que deseas asignar la siguiente descripción: <span className='font-bold italic'>"{description}"</span>
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                     <input type="hidden" name="serviceIds" value={selectedServiceIds.join(',')} />
                     <input type="hidden" name="description" value={description} />
                    <div>
                        <Label>Servicios</Label>
                        <p className='text-sm text-muted-foreground'>Selecciona los servicios para asignarles esta descripción.</p>
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
                                    <TableHead>Descripción Actual</TableHead>
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
                                            <span className='line-clamp-1 italic text-muted-foreground'>{service.description || "Ninguna"}</span>
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

