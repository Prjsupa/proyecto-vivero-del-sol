
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
import { deleteCategory } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Trash } from "lucide-react";

export function DeleteCategoryAlert({ categoryName, productCount, onCategoryDeleted }: { categoryName: string, productCount: number, onCategoryDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (productCount > 0) {
            toast({
                title: "Error",
                description: `No se puede eliminar la categoría porque contiene ${productCount} producto(s).`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await deleteCategory(categoryName);
        setIsLoading(false);

        if (result?.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: result.data,
            });
            onCategoryDeleted();
        } else {
            toast({
                title: "Error",
                description: result?.message || "Ocurrió un error al eliminar la categoría.",
                variant: "destructive",
            });
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar Categoría
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {productCount > 0 ? (
                            <>
                                No puedes eliminar la categoría <span className="font-bold">{categoryName}</span> porque contiene {productCount} producto(s).
                                Primero debes mover o eliminar los productos de esta categoría.
                            </>
                        ) : (
                            <>
                                Esta acción eliminará la categoría <span className="font-bold">{categoryName}</span>. 
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
                            'Sí, eliminar categoría'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

