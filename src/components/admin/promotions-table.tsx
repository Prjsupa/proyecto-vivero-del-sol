
'use client';

import type { Promotion } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Gift } from "lucide-react";
// import { PromotionActions } from "./promotion-actions";

export function PromotionsTable({ promotions }: { promotions: Promotion[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Listado de Promociones</CardTitle>
                <CardDescription>Aquí aparecerán todas las promociones creadas.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {promotions.length > 0 ? (
                            promotions.map((promotion) => (
                                <TableRow key={promotion.id}>
                                    <TableCell className="font-medium">{promotion.name}</TableCell>
                                    <TableCell>
                                        {/* Badge de estado */}
                                    </TableCell>
                                     <TableCell>{promotion.discount_type}</TableCell>
                                    <TableCell>
                                        {/* <PromotionActions promotion={promotion} /> */}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                     <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Gift className="h-12 w-12" />
                                        <p className="font-semibold">No se encontraron promociones.</p>
                                        <p className="text-sm">Puedes crear una nueva promoción para empezar.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
