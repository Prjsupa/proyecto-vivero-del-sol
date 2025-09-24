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
import { deleteProductDescription } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Trash } from "lucide-react";

export function DeleteProductDescriptionAlert({ description, productCount, onDescriptionDeleted }: { description: string, productCount: number, onDescriptionDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (productCount > 0) {
            toast({
                title: "Error",
                description: `No se puede eliminar la descripción porque está en uso en ${productCount} producto(s).`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await deleteProductDescription(description);
        setIsLoading(false);

        if (result?.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: result.data,
            });
            onDescriptionDeleted();
        } else {
            toast({
                title: "Error",
                description: result?.message || "Ocurrió un error al eliminar la descripción.",
                variant: "destructive",
            });
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar Descripción
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {productCount > 0 ? (
                            <>
                                No puedes eliminar esta descripción porque está en uso en <span className="font-bold">{productCount} producto(s)</span>.
                                Primero debes cambiar la descripción de esos productos.
                            </>
                        ) : (
                            <>
                                Esta acción eliminará la descripción. Esto no se puede deshacer.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading || productCount > 0}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            'Sí, eliminar descripción'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}