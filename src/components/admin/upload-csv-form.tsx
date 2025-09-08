
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUp, Loader2, AlertCircle } from 'lucide-react';
import { uploadProductsFromCsv } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Importar Productos desde CSV</DialogTitle>
                    <DialogDescription>
                        Selecciona un archivo CSV para añadir productos en lote.
                        Asegúrate de que el archivo tenga las cabeceras: `name,category,price,stock,available,description`.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="csv-file">Archivo CSV</Label>
                        <Input id="csv-file" name="csv-file" type="file" accept=".csv" ref={fileInputRef} />
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Formato Requerido</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc list-inside text-xs">
                                <li><b>category:</b> 'Planta de interior', 'Planta de exterior', etc.</li>
                                <li><b>available:</b> TRUE o FALSE</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <DialogFooter>
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
