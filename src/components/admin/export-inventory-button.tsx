
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export function ExportInventoryButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/export-inventory');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventario-vivero.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "¡Éxito!",
                description: "La exportación del inventario se ha iniciado.",
            });

        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo exportar el inventario.",
                variant: "destructive",
            });
            console.error("Export failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleExport} disabled={isLoading} variant="outline">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Inventario
                </>
            )}
        </Button>
    );
}
