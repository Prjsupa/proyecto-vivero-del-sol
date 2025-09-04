
import { AddProductForm } from "@/components/admin/add-product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Database } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/definitions";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

async function getProducts(): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="p-4 md:p-8 space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Gestión de Productos</h1>
                    <p className="text-muted-foreground">Añade, edita y gestiona todos los productos de tu vivero.</p>
                </div>
                <AddProductForm />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Productos</CardTitle>
                    <CardDescription>
                        Una lista de todos los productos en tu inventario.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Imagen</span>
                                </TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="hidden md:table-cell">Precio</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt={product.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={product.img_url || 'https://placehold.co/64'}
                                                width="64"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.available ? 'default' : 'destructive'} className={cn(product.available ? 'bg-green-500' : 'bg-red-500', 'text-white')}>
                                                {product.available ? 'Disponible' : 'No disponible'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            ${product.price.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem>Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Database className="h-12 w-12" />
                                            <p>No se encontraron productos.</p>
                                            <p className="text-sm">Intenta añadir un producto para empezar.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

