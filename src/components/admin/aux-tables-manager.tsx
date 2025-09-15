
'use client';
import { useState } from 'react';
import type { Product, Service } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryProductManager } from './category-product-manager';
import { SubcategoryProductManager } from './subcategory-product-manager';
import { ServiceCategoryManager } from './service-category-manager';
import { CreateCategoryForm } from './create-category-form';
import { CreateSubcategoryForm } from './create-subcategory-form';
import { CreateServiceCategoryForm } from './create-service-category-form';

type AuxTableType = 'product_categories' | 'product_subcategories' | 'service_categories';

interface AuxTablesManagerProps {
    products: Product[];
    services: Service[];
    productCategories: string[];
    productSubcategories: string[];
    serviceCategories: string[];
}


export function AuxTablesManager({ 
    products, 
    services,
    productCategories, 
    productSubcategories, 
    serviceCategories 
}: AuxTablesManagerProps) {
    const [selectedTable, setSelectedTable] = useState<AuxTableType>('product_categories');

    const renderContent = () => {
        switch (selectedTable) {
            case 'product_categories':
                return <CategoryProductManager allProducts={products} allCategories={productCategories} />;
            case 'product_subcategories':
                return <SubcategoryProductManager allProducts={products} allSubcategories={productSubcategories} />;
            case 'service_categories':
                return <ServiceCategoryManager allServices={services} allCategories={serviceCategories} />;
            default:
                return null;
        }
    };
    
    const renderCreateButton = () => {
        switch (selectedTable) {
            case 'product_categories':
                return <CreateCategoryForm allProducts={products} allCategories={productCategories} />;
            case 'product_subcategories':
                return <CreateSubcategoryForm allProducts={products} allSubcategories={productSubcategories} />;
            case 'service_categories':
                return <CreateServiceCategoryForm allServices={services} allCategories={serviceCategories} />;
            default:
                return null;
        }
    }

    return (
        <div className='space-y-6'>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="w-full md:w-72">
                            <Select onValueChange={(value) => setSelectedTable(value as AuxTableType)} value={selectedTable}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una tabla para gestionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="product_categories">Categorías de Productos</SelectItem>
                                    <SelectItem value="product_subcategories">Subcategorías de Productos</SelectItem>
                                    <SelectItem value="service_categories">Categorías de Servicios</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="self-end md:self-center">
                            {renderCreateButton()}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {renderContent()}
        </div>
    );
}
