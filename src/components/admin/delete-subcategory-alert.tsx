
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
import { deleteSubcategory } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Trash } from "lucide-react";

export function DeleteSubcategoryAlert({ subcategoryName, productCount, onSubcategoryDeleted }: { subcategoryName: string, productCount: number, onSubcategoryDeleted: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        if (productCount > 0) {
            toast({
                title: "Error",
                description: `No se puede eliminar la subcategoría porque contiene ${productCount} producto(s).`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const result = await deleteSubcategory(subcategoryName);
        setIsLoading(false);

        if (result?.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: result.data,
            });
            onSubcategoryDeleted();
        } else {
            toast({
                title: "Error",
                description: result?.message || "Ocurrió un error al eliminar la subcategoría.",
                variant: "destructive",
            });
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar Subcategoría
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {productCount > 0 ? (
                            <>
                                No puedes eliminar la subcategoría <span className="font-bold">{subcategoryName}</span> porque contiene {productCount} producto(s).
                                Primero debes mover o eliminar los productos de esta subcategoría.
                            </>
                        ) : (
                            <>
                                Esta acción eliminará la subcategoría <span className="font-bold">{subcategoryName}</span>. 
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
                            'Sí, eliminar subcategoría'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
