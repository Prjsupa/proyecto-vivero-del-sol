
'use client';
import { useActionState, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { AlertCircle, PlusCircle, Loader2, Search } from 'lucide-react';
import { updateProductsCategory } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/definitions';
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

export function AddProductsToCategoryForm({ categoryName, allProducts, onActionCompleted }: { categoryName: string, allProducts: Product[], onActionCompleted: () => void }) {
    const [state, formAction] = useActionState(updateProductsCategory, { message: '' });
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
            setSelectedProductIds([]);
            setSearchTerm('');
        }
        setIsDialogOpen(open);
    }
    
    const productsNotInThisCategory = useMemo(() => {
        return allProducts.filter(p => p.category !== categoryName);
    }, [allProducts, categoryName]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return productsNotInThisCategory;
        return productsNotInThisCategory.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [productsNotInThisCategory, searchTerm]);

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
                 <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Productos
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Añadir Productos a la Categoría: <span className='font-bold'>{categoryName}</span></DialogTitle>
                    <DialogDescription>
                       Selecciona los productos que deseas mover a esta categoría.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="grid gap-4 py-4">
                     <input type="hidden" name="productIds" value={selectedProductIds.join(',')} />
                     <input type="hidden" name="category" value={categoryName} />
                    <div>
                        <Label>Productos</Label>
                        <p className='text-sm text-muted-foreground'>Selecciona los productos para mover a esta categoría.</p>
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
                                    <TableHead>Categoría Actual</TableHead>
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
                                            <Badge variant="secondary">{product.category}</Badge>
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
