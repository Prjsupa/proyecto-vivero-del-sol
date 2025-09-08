
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUp, Loader2, AlertCircle, Download } from 'lucide-react';
import { uploadProductsFromCsv } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : <><FileUp className="mr-2 h-4 w-4" /> Subir Archivo</>}
        </Button>
    )
}

export function UploadCsvForm() {
    const [state, formAction] = useActionState(uploadProductsFromCsv, { message: '' });
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
            formRef.current?.reset();
        } else if (state?.message && state.message !== 'success') {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileUp className="mr-2 h-4 w-4" />
                    Importar CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Importar Productos desde CSV</DialogTitle>
                    <DialogDescription>
                        Añade productos en lote subiendo un archivo .csv. Asegúrate de que el archivo tenga una fila de cabecera con los campos correctos.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef}>
                     <ScrollArea className="max-h-[60vh] p-1">
                        <div className="space-y-4 p-4">
                            <div className="space-y-2">
                                <Label htmlFor="csv-file">Archivo CSV</Label>
                                <Input id="csv-file" name="csv-file" type="file" accept=".csv" ref={fileInputRef} />
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Estructura del CSV</AlertTitle>
                                <AlertDescription>
                                    <p className="text-xs mb-2">La primera fila debe ser la cabecera: <strong>name,sku,category,subcategory,price,stock,available,description</strong></p>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        <li><b>name:</b> Texto (Ej: "Monstera Deliciosa")</li>
                                        <li><b>sku:</b> Texto (opcional, ej: 'PL-INT-001')</li>
                                        <li><b>category:</b> 'Planta de interior', 'Herramienta', etc.</li>
                                        <li><b>subcategory:</b> Texto (opcional, ej: 'Hojas grandes')</li>
                                        <li><b>price:</b> Número (Ej: 25,99)</li>
                                        <li><b>stock:</b> Número entero (Ej: 150)</li>
                                        <li><b>available:</b> TRUE o FALSE</li>
                                        <li><b>description:</b> Texto (opcional)</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            <Button variant="link" asChild className="p-0 h-auto self-start">
                                <Link href="/api/sample-csv">
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar CSV de ejemplo
                                </Link>
                            </Button>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
