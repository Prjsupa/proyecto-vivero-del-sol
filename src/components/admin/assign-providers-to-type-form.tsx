'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Provider, ProviderType } from '@/lib/definitions';
import { assignProvidersToType } from '@/lib/aux-actions';

interface AssignProvidersToTypeFormProps {
    allProviders: Provider[];
    allProviderTypes: ProviderType[];
    onActionCompleted: () => void;
}

export function AssignProvidersToTypeForm({ allProviders, allProviderTypes, onActionCompleted }: AssignProvidersToTypeFormProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Filtrar proveedores sin tipo o con tipo diferente al seleccionado
    const availableProviders = allProviders.filter(provider => 
        !provider.provider_type_code || provider.provider_type_code !== selectedType
    );

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!selectedType || selectedProviders.length === 0) return;
        
        setIsLoading(true);
        
        const formData = new FormData();
        formData.append('provider_type_code', selectedType);
        formData.append('provider_ids', selectedProviders.join(','));
        
        try {
            const result = await assignProvidersToType({ message: '' }, formData);
            
            if (result.message === 'success') {
                toast({ title: '¡Éxito!', description: result.data });
                setIsDialogOpen(false);
                setSelectedType('');
                setSelectedProviders([]);
                onActionCompleted();
            } else {
                toast({ title: 'Error', description: result.message, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Error inesperado al asignar proveedores', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    // Resetear el estado cuando se abre el modal
    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (open) {
            setSelectedType('');
            setSelectedProviders([]);
        }
    };

    const handleProviderToggle = (providerId: string, checked: boolean) => {
        if (checked) {
            setSelectedProviders(prev => [...prev, providerId]);
        } else {
            setSelectedProviders(prev => prev.filter(id => id !== providerId));
        }
    };

    const handleSelectAll = () => {
        if (selectedProviders.length === availableProviders.length) {
            setSelectedProviders([]);
        } else {
            setSelectedProviders(availableProviders.map(p => p.id.toString()));
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Asignar Proveedores a Tipo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Asignar Proveedores a Tipo</DialogTitle>
                    <DialogDescription>
                        Selecciona un tipo de proveedor y los proveedores que quieres asignar a ese tipo.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
                    <div className="space-y-2">
                        <Label htmlFor="provider_type">Tipo de Proveedor</Label>
                        <Select onValueChange={setSelectedType} value={selectedType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo de proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {allProviderTypes.map(type => (
                                    <SelectItem key={type.code} value={type.code}>
                                        {type.code} - {type.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedType && (
                        <div className="space-y-2 flex-1 min-h-0">
                            <div className="flex justify-between items-center">
                                <Label>Proveedores Disponibles ({availableProviders.length})</Label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    {selectedProviders.length === availableProviders.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                                </Button>
                            </div>
                            
                            <div className="border rounded-md p-3 overflow-y-auto max-h-60">
                                {availableProviders.length > 0 ? (
                                    <div className="space-y-2">
                                        {availableProviders.map(provider => (
                                            <div key={provider.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`provider-${provider.id}`}
                                                    checked={selectedProviders.includes(provider.id.toString())}
                                                    onCheckedChange={(checked) => 
                                                        handleProviderToggle(provider.id.toString(), !!checked)
                                                    }
                                                />
                                                <Label 
                                                    htmlFor={`provider-${provider.id}`}
                                                    className="text-sm font-normal cursor-pointer flex-1"
                                                >
                                                    {provider.name}
                                                    {provider.provider_type_code && (
                                                        <span className="text-muted-foreground ml-2">
                                                            (Tipo actual: {provider.provider_type_code})
                                                        </span>
                                                    )}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        No hay proveedores disponibles para este tipo
                                    </p>
                                )}
                            </div>
                            
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={!selectedType || selectedProviders.length === 0 || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Asignando...
                                </>
                            ) : (
                                `Asignar ${selectedProviders.length} Proveedor${selectedProviders.length !== 1 ? 'es' : ''}`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
