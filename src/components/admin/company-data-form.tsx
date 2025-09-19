
'use client';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CompanyData } from '@/lib/definitions';
import { updateCompanyData } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const provinces = [
    "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
    "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro",
    "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", 
    "Tierra del Fuego, Antártida e Islas del Atlántico Sur", "Tucumán"
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
        </Button>
    )
}

function FieldError({ errors }: { errors?: string[] }) {
    if (!errors) return null;
    return (
        <p className="text-sm text-destructive flex items-center gap-1 mt-1">
            <AlertCircle size={14} />
            {errors[0]}
        </p>
    )
}

export function CompanyDataForm({ companyData }: { companyData: CompanyData }) {
    const [state, formAction] = useActionState(updateCompanyData, { message: '' });
    const { toast } = useToast();

    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: '¡Éxito!',
                description: state.data,
            });
        } else if (state?.message && state.message !== 'success') {
             toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive'
            });
        }
    }, [state, toast]);

    return (
        <Card>
            <form action={formAction}>
                <CardHeader>
                    <CardTitle>Información General y Fiscal</CardTitle>
                    <CardDescription>
                        Esta información puede ser utilizada en facturas y otros documentos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="razon_social">Razón Social</Label>
                        <Input id="razon_social" name="razon_social" defaultValue={companyData.razon_social || ''} />
                        <FieldError errors={state.errors?.razon_social} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="nombre_fantasia">Nombre de Fantasía</Label>
                        <Input id="nombre_fantasia" name="nombre_fantasia" defaultValue={companyData.nombre_fantasia || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cuit">CUIT</Label>
                        <Input id="cuit" name="cuit" defaultValue={companyData.cuit || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="tipo_resp">Tipo de Responsabilidad</Label>
                        <Input id="tipo_resp" name="tipo_resp" defaultValue={companyData.tipo_resp || ''} placeholder="Ej: Responsable Inscripto" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ing_brutos">Ingresos Brutos</Label>
                        <Input id="ing_brutos" name="ing_brutos" defaultValue={companyData.ing_brutos || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inicio_activ">Inicio de Actividades</Label>
                        <Input id="inicio_activ" name="inicio_activ" defaultValue={companyData.inicio_activ || ''} placeholder="Ej: 01/01/2020" />
                    </div>
                     <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                        <Label htmlFor="domicilio">Domicilio</Label>
                        <Input id="domicilio" name="domicilio" defaultValue={companyData.domicilio || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="localidad">Localidad</Label>
                        <Input id="localidad" name="localidad" defaultValue={companyData.localidad || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="provincia">Provincia</Label>
                         <Select name="provincia" defaultValue={companyData.provincia || ''}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar provincia..." /></SelectTrigger>
                            <SelectContent>
                                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" name="telefono" defaultValue={companyData.telefono || ''} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="web">Sitio Web</Label>
                        <Input id="web" name="web" type="url" defaultValue={companyData.web || ''} placeholder="https://..." />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input id="whatsapp" name="whatsapp" defaultValue={companyData.whatsapp || ''} placeholder="Ej: +54911..." />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    );
}
