
'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Search } from 'lucide-react';
import { createSubcategoryAndAssignProducts } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/definitions';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : 'Crear y Asignar Productos'}
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

export function CreateSubcategoryForm({ allProducts, allSubcategories }: { allProducts: Product[], allSubcategories: string[] }) {
    const [state, formAction] = useActionState(createSubcategoryAndAssignProducts, { message: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            setIsDialogOpen(false);
            formRef.current?.reset();
            setSelectedProductIds([]);
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
            setSelectedProductIds([]);
            setSearchTerm('');
        }
        setIsDialogOpen(open);
    }
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return allProducts;
        return allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allProducts, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProductIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectRow = (productId: string, checked: boolean) => {
        if (checked) {
            setSelectedProductIds(prev => [...prev, productId]);
        } else {
            setSelectedProductIds(prev => prev.filter(id => id !== productId));
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Subcategoría
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Subcategoría</DialogTitle>
                    <DialogDescription>
                       Define el nombre de la nueva subcategoría y selecciona los productos que pertenecerán a ella.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                     <input type="hidden" name="productIds" value={selectedProductIds.join(',')} />
                    <div className="space-y-2">
                        <Label htmlFor="newSubcategoryName">Nombre de la Nueva Subcategoría</Label>
                        <Input id="newSubcategoryName" name="newSubcategoryName" placeholder="Ej: Hojas Grandes"/>
                        <FieldError errors={state.errors?.newSubcategoryName} />
                         {state.message && state.message !== 'success' && !state.errors && (
                             <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                <AlertCircle size={14} /> {state.message}
                            </p>
                         )}
                    </div>
                    
                    <div>
                        <Label>Asignar Productos</Label>
                        <p className='text-sm text-muted-foreground'>Selecciona los productos para añadir o mover a esta nueva subcategoría.</p>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar productos..." 
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
                                            checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Subcategoría Actual</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <Checkbox
                                                onCheckedChange={(checked) => handleSelectRow(product.id, !!checked)}
                                                checked={selectedProductIds.includes(product.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>
                                            {product.subcategory ? (
                                                 <Badge variant="secondary">{product.subcategory}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground italic">Ninguna</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                    <p className="text-sm text-muted-foreground">{selectedProductIds.length} de {filteredProducts.length} producto(s) seleccionado(s).</p>

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
