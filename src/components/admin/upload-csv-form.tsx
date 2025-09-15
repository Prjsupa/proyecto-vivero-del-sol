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
                    Importar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle>Importar Productos desde Archivo</DialogTitle>
                    <DialogDescription>
                        Añade productos en lote subiendo un archivo .csv o .xlsx. Asegúrate de que el archivo tenga una fila de cabecera con los campos correctos.
                    </DialogDescription>
                </DialogHeader>
                 <form action={formAction} ref={formRef} className="flex-grow overflow-hidden flex flex-col">
                    <ScrollArea className="flex-grow pr-6 -mr-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="file-upload">Archivo CSV o XLSX</Label>
                                <Input id="file-upload" name="file-upload" type="file" accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ref={fileInputRef} />
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Estructura del Archivo</AlertTitle>
                                <AlertDescription>
                                    <p className="text-xs mb-2">La primera fila debe ser la cabecera: <strong>name,sku,category,subcategory,precio_costo,precio_venta,stock,available,description,color,tamaño,proveedor</strong></p>
                                    <ul className="list-disc list-inside text-xs space-y-1">
                                        <li><b>name:</b> Texto (Ej: "Monstera Deliciosa")</li>
                                        <li><b>sku:</b> Texto (opcional, ej: 'PL-INT-001')</li>
                                        <li><b>category:</b> 'Planta de interior', 'Herramienta', etc.</li>
                                        <li><b>subcategory:</b> Texto (opcional, ej: 'Hojas grandes')</li>
                                        <li><b>precio_costo:</b> Número (Ej: 18000)</li>
                                        <li><b>precio_venta:</b> Número (Ej: 25990)</li>
                                        <li><b>stock:</b> Número entero (Ej: 150)</li>
                                        <li><b>available:</b> TRUE o FALSE</li>
                                        <li><b>description:</b> Texto (opcional)</li>
                                        <li><b>color:</b> Texto (opcional, ej: 'Verde')</li>
                                        <li><b>tamaño:</b> Texto (opcional, ej: '60cm')</li>
                                        <li><b>proveedor:</b> Texto (opcional, ej: 'Proveedor A')</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                             <div className="flex items-center gap-4 flex-wrap">
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/api/sample-csv">
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar ejemplo .csv
                                    </Link>
                                </Button>
                                 <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/api/sample-xlsx">
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar ejemplo .xlsx
                                    </Link>
                                </Button>
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/api/template-csv">
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar plantilla .csv
                                    </Link>
                                </Button>
                                 <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/api/template-xlsx">
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar plantilla .xlsx
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                    
                    <DialogFooter className="pt-4 border-t mt-4 shrink-0">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
