
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Invoice } from '@/lib/definitions';

export function ExportInvoicesButton({ invoices }: { invoices: Invoice[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const invoiceIds = invoices.map(i => i.id);
            if (invoiceIds.length === 0) {
                 toast({ title: "Sin datos", description: "No hay facturas para exportar.", variant: "destructive" });
                 return;
            }

            const response = await fetch('/api/export-invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceIds })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const disposition = response.headers.get('content-disposition');
            const filename = disposition ? disposition.split('filename=')[1].replace(/"/g, '') : 'facturas.xlsx';
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: "¡Éxito!",
                description: "La exportación de facturas se ha iniciado.",
            });

        } catch (error) {
             toast({
                title: "Error",
                description: "No se pudo exportar el listado de facturas.",
                variant: "destructive",
            });
            console.error("Export failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleExport} disabled={isLoading || invoices.length === 0} variant="outline">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a Excel
                </>
            )}
        </Button>
    );
}
