
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
import { deletePromotion } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function DeletePromotionAlert({ promotionId, promotionName }: { promotionId: number, promotionName: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deletePromotion(promotionId);
    setIsLoading(false);

    if (result?.message === 'success') {
      toast({
        title: "¡Éxito!",
        description: result.data,
      });
    } else {
      toast({
        title: "Error",
        description: result?.message || "Ocurrió un error al eliminar la promoción.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. Esto eliminará permanentemente la promoción
          <span className="font-semibold"> {promotionName} </span>
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
            'Sí, eliminar promoción'
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
