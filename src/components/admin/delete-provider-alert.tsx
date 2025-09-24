
'use client';

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProvider } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function DeleteProviderAlert({ providerId, providerName }: { providerId: number, providerName: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        const result = await deleteProvider(providerId);
        setIsLoading(false);

        if (result?.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: result.data,
            });
        } else {
            toast({
                title: "Error",
                description: result?.message || "Ocurrió un error al eliminar el proveedor.",
                variant: "destructive",
            });
        }
    };

    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente al proveedor
                    <span className="font-semibold"> {providerName} </span>
                    de la base de datos.
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
                        'Sí, eliminar proveedor'
                    )}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}
