'use client';
import { useState } from 'react';
import type { Product, Service, Provider, ProviderType, IncomeVoucher } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryProductManager } from './category-product-manager';
import { SubcategoryProductManager } from './subcategory-product-manager';
import { ServiceCategoryManager } from './service-category-manager';
import { CreateCategoryForm } from './create-category-form';
import { CreateSubcategoryForm } from './create-subcategory-form';
import { CreateServiceCategoryForm } from './create-service-category-form';
import { ColorManager } from './color-manager';
import { SizeManager } from './size-manager';
import { ProductDescriptionManager } from './product-description-manager';
import { ServiceDescriptionManager } from './service-description-manager';
import { CreateColorForm } from './create-color-form';
import { CreateSizeForm } from './create-size-form';
import { CreateProductDescriptionForm } from './create-product-description-form';
import { CreateServiceDescriptionForm } from './create-service-description-form';
import { ProviderTypeManager } from './provider-type-manager';
import { CreateProviderTypeForm } from './create-provider-type-form';
import { IncomeVoucherManager } from './income-voucher-manager';
import { CreateIncomeVoucherForm } from './create-income-voucher-form';
import { useRouter } from 'next/navigation';

type AuxTableType = 
    | 'product_categories' 
    | 'product_subcategories' 
    | 'service_categories'
    | 'product_colors'
    | 'product_sizes'
    | 'product_descriptions'
    | 'service_descriptions'
    | 'provider_types'
    | 'income_vouchers';

interface AuxTablesManagerProps {
    products: Product[];
    services: Service[];
    providers: Provider[];
    providerTypes: ProviderType[];
    incomeVouchers: IncomeVoucher[];
    productCategories: string[];
    productSubcategories: string[];
    serviceCategories: string[];
    productColors: string[];
    productSizes: string[];
    productDescriptions: string[];
    serviceDescriptions: string[];
}


export function AuxTablesManager({ 
    products, 
    services,
    providers,
    providerTypes,
    incomeVouchers,
    productCategories, 
    productSubcategories, 
    serviceCategories,
    productColors,
    productSizes,
    productDescriptions,
    serviceDescriptions,
}: AuxTablesManagerProps) {
    const [selectedTable, setSelectedTable] = useState<AuxTableType>('product_categories');
    const router = useRouter();

    const onActionCompleted = () => {
        router.refresh();
    }

    const renderContent = () => {
        switch (selectedTable) {
            case 'product_categories':
                return <CategoryProductManager allProducts={products} allCategories={productCategories} onActionCompleted={onActionCompleted} />;
            case 'product_subcategories':
                return <SubcategoryProductManager allProducts={products} allSubcategories={productSubcategories} onActionCompleted={onActionCompleted} />;
            case 'service_categories':
                return <ServiceCategoryManager allServices={services} allCategories={serviceCategories} onActionCompleted={onActionCompleted} />;
            case 'product_colors':
                return <ColorManager allProducts={products} allColors={productColors} onActionCompleted={onActionCompleted} />;
            case 'product_sizes':
                return <SizeManager allProducts={products} allSizes={productSizes} onActionCompleted={onActionCompleted} />;
            case 'product_descriptions':
                return <ProductDescriptionManager allProducts={products} allDescriptions={productDescriptions} onActionCompleted={onActionCompleted} />;
            case 'service_descriptions':
                return <ServiceDescriptionManager allServices={services} allDescriptions={serviceDescriptions} onActionCompleted={onActionCompleted} />;
            case 'provider_types':
                return <ProviderTypeManager allProviders={providers} allProviderTypes={providerTypes} onActionCompleted={onActionCompleted} />;
            case 'income_vouchers':
                return <IncomeVoucherManager allVouchers={incomeVouchers} onActionCompleted={onActionCompleted} />;
            default:
                return null;
        }
    };
    
    const renderCreateButton = () => {
        switch (selectedTable) {
            case 'product_categories':
                return <CreateCategoryForm allProducts={products} allCategories={productCategories} onActionCompleted={onActionCompleted}/>;
            case 'product_subcategories':
                return <CreateSubcategoryForm allProducts={products} allSubcategories={productSubcategories} onActionCompleted={onActionCompleted} />;
            case 'service_categories':
                return <CreateServiceCategoryForm allServices={services} allCategories={serviceCategories} onActionCompleted={onActionCompleted} />;
            case 'product_colors':
                return <CreateColorForm allProducts={products} onActionCompleted={onActionCompleted} />;
            case 'product_sizes':
                return <CreateSizeForm allProducts={products} onActionCompleted={onActionCompleted} />;
            case 'product_descriptions':
                return <CreateProductDescriptionForm allProducts={products} onActionCompleted={onActionCompleted} />;
            case 'service_descriptions':
                return <CreateServiceDescriptionForm allServices={services} onActionCompleted={onActionCompleted} />;
            case 'provider_types':
                return <CreateProviderTypeForm onActionCompleted={onActionCompleted} />;
            case 'income_vouchers':
                return <CreateIncomeVoucherForm onActionCompleted={onActionCompleted} />;
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
                                    <SelectItem value="provider_types">Tipos de Proveedor</SelectItem>
                                    <SelectItem value="income_vouchers">Comprobantes de Ingreso</SelectItem>
                                    <SelectItem value="product_colors">Colores (Productos)</SelectItem>
                                    <SelectItem value="product_sizes">Tamaños (Productos)</SelectItem>
                                    <SelectItem value="product_descriptions">Descripciones (Productos)</SelectItem>
                                    <SelectItem value="service_descriptions">Descripciones (Servicios)</SelectItem>
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
