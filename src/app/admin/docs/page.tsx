import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Database, Sparkles } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Novedades y Registro de Cambios</h1>
                <p className="text-lg text-muted-foreground">
                    Aquí encontrarás las últimas actualizaciones y nuevas funcionalidades del sistema.
                </p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Database className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Nuevas Tablas Auxiliares: Comprobantes</CardTitle>
                                <CardDescription>
                                    Se ha añadido una nueva sección para gestionar los tipos de comprobantes que maneja el sistema.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pl-16">
                        <h3 className="font-semibold text-lg">¿Qué puedes hacer?</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>
                                <strong>Comprobantes de Ingreso:</strong> Define los tipos de comprobantes que representan una entrada de dinero o productos (Ej: Factura A, Nota de Crédito, Remito de Cliente).
                            </li>
                            <li>
                                <strong>Comprobantes de Egreso:</strong> Define los tipos de comprobantes que representan una salida (Ej: Factura de Compra, Nota de Débito a Proveedor).
                            </li>
                            <li>
                                <strong>Gestión Completa:</strong> Puedes agregar, editar y eliminar los códigos y descripciones de cada tipo de comprobante.
                            </li>
                        </ul>
                        <div className="flex items-center gap-2 pt-2">
                             <Lightbulb className="h-5 w-5 text-yellow-500" />
                            <p className="text-sm text-muted-foreground">
                                <strong>Tip:</strong> Usa códigos cortos y descripciones claras para una fácil identificación en el futuro.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="bg-accent/50 p-2 rounded-lg">
                                <Sparkles className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <div>
                                <CardTitle>Mejora de Experiencia de Usuario</CardTitle>
                                <CardDescription>
                                    Se ha optimizado la interacción en las Tablas Auxiliares.
                                </CardDescription>
                            </div>
                        </CardHeader>
                    <CardContent className="space-y-2 pl-16">
                        <p className="text-muted-foreground">
                            Al crear, editar o eliminar un registro en cualquier Tabla Auxiliar, el componente ahora se actualiza automáticamente **sin recargar la página completa**. Esto proporciona una experiencia mucho más rápida y fluida, manteniendo tu contexto de trabajo.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
