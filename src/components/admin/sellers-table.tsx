'use client';

import type { Seller } from "@/lib/definitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { SellerActions } from "./seller-actions";

function getInitials(name: string, lastName: string) {
    return `${name?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

export function SellersTable({ sellers }: { sellers: Seller[] }) {

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="hidden sm:table-cell">DNI</TableHead>
                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                    <TableHead>
                        <span className="sr-only">Acciones</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sellers.length > 0 ? (
                    sellers.map((seller) => (
                        <TableRow key={seller.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{getInitials(seller.name, seller.last_name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{seller.name} {seller.last_name}</div>
                                        <div className="text-sm text-muted-foreground">{seller.address}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{seller.dni}</TableCell>
                            <TableCell className="hidden md:table-cell">{seller.phone}</TableCell>
                            <TableCell className="text-right">
                                 <SellerActions seller={seller} />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <User className="h-12 w-12" />
                                <p className="font-semibold">No se encontraron vendedores.</p>
                                <p className="text-sm">Puedes agregar un nuevo vendedor para empezar.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
