import { AddProductForm } from "@/components/admin/add-product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/definitions";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import { ProductActions } from "@/components/admin/product-actions";

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
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Productos</h1>
                    <p className="text-muted-foreground">Añade, edita y gestiona todos los productos de tu vivero.</p>
                </div>
                <AddProductForm />
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Imagen</span>
                                </TableHead>
                                <TableHead>Nombre</TableHead>
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
                                        <TableCell className="font-medium">
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">{product.category}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.available ? 'default' : 'outline'} className={cn(product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                {product.available ? 'Disponible' : 'No disponible'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {formatPrice(product.price)}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                        <TableCell>
                                            <ProductActions product={product} />
                                        </TableCell>
                                    </TableRow>
                                ))
                           ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Package className="h-12 w-12" />
                                            <p className="font-semibold">No se encontraron productos.</p>
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
