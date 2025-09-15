
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
import { deleteColor } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Trash } from "lucide-react";

export function DeleteColorAlert({ colorName, productCount, onColorDeleted }: { colorName: string, productCount: number, onColorDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (productCount > 0) {
            toast({
                title: "Error",
                description: `No se puede eliminar el color porque está en uso en ${productCount} producto(s).`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await deleteColor(colorName);
        setIsLoading(false);

        if (result?.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: result.data,
            });
            onColorDeleted();
        } else {
            toast({
                title: "Error",
                description: result?.message || "Ocurrió un error al eliminar el color.",
                variant: "destructive",
            });
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar Color
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {productCount > 0 ? (
                            <>
                                No puedes eliminar el color <span className="font-bold">{colorName}</span> porque está en uso en {productCount} producto(s).
                                Primero debes cambiar el color de esos productos.
                            </>
                        ) : (
                            <>
                                Esta acción eliminará el color <span className="font-bold">{colorName}</span>. 
                                Esto no se puede deshacer.
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
                            'Sí, eliminar color'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
