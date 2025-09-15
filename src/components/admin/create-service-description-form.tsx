'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Search } from 'lucide-react';
import { createServiceDescriptionAndAssign } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/lib/definitions';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear y Asignar'}
        </Button>
    )
}

function FieldError({ errors }: { errors?: string[] }) {
    if (!errors) return null;
    return (
        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
            <AlertCircle size={14} />
            {errors[0]}
        </p>
    )
}

export function CreateServiceDescriptionForm({ allServices }: { allServices: Service[] }) {
    const [state, formAction] = useActionState(createServiceDescriptionAndAssign, { message: '' });
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
            formRef.current?.reset();
            setSelectedServiceIds([]);
            setSearchTerm('');
            window.location.reload();
        } else if (state?.message && state.message !== 'success' && !state.errors) {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    const onDialogChange = (open: boolean) => {
        if (!open) {
            formRef.current?.reset();
            setSelectedServiceIds([]);
            setSearchTerm('');
        }
        setIsDialogOpen(open);
    }
    
    const filteredServices = useMemo(() => {
        if (!searchTerm) return allServices;
        return allServices.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allServices, searchTerm]);

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
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Descripción (Servicios)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Descripción de Servicio</DialogTitle>
                    <DialogDescription>
                       Define la nueva descripción y selecciona los servicios a los que se asignará.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                     <input type="hidden" name="serviceIds" value={selectedServiceIds.join(',')} />
                    <div className="space-y-2">
                        <Label htmlFor="newDescription">Texto de la Nueva Descripción</Label>
                        <Textarea id="newDescription" name="newDescription" placeholder="Ej: Incluye visita, diagnóstico y presupuesto..."/>
                        <FieldError errors={state.errors?.newDescription} />
                         {state.message && state.message !== 'success' && !state.errors && (
                             <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {state.message}
                            </p>
                         )}
                    </div>
                    
                    <div>
                        <Label>Asignar Servicios (Opcional)</Label>
                        <p className='text-sm text-muted-foreground'>Selecciona los servicios para asignarles esta nueva descripción.</p>
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
