
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteSelectedServices } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Trash } from "lucide-react";
import { BatchEditServiceCategoryForm } from "./batch-edit-service-category-form";

export function ServiceCategoryBatchActions({ selectedServiceIds, allCategories, onActionCompleted }: { selectedServiceIds: string[], allCategories: string[], onActionCompleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteSelectedServices(selectedServiceIds);
        setIsLoading(false);

        if (result?.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: result.data,
            });
            onActionCompleted();
        } else {
            toast({
                title: "Error",
                description: result?.message || "Ocurrió un error al eliminar los servicios.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
                 <p className="text-sm font-semibold">{selectedServiceIds.length} servicio(s) seleccionado(s)</p>
            </div>
            <div className="flex items-center gap-2">
                 <BatchEditServiceCategoryForm 
                    serviceIds={selectedServiceIds}
                    allCategories={allCategories}
                    onActionCompleted={onActionCompleted}
                 />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isLoading}>
                             <Trash className="mr-2 h-4 w-4" />
                            Eliminar seleccionados
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente {selectedServiceIds.length} servicio(s) de la base de datos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    'Sí, eliminar servicios'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
