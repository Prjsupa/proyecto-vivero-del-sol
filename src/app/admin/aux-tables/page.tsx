

import { createClient } from "@/lib/supabase/server";
import type { Product, Service, Provider, ProviderType, IncomeVoucher, ExpenseVoucher, UnitOfMeasure, UnitOfTime, UnitOfMass, UnitOfVolume, PointOfSale, AccountStatus, Currency } from "@/lib/definitions";
import { AuxTablesManager } from "@/components/admin/aux-tables-manager";

async function getData() {
    const supabase = createClient();
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

    if (productsError) console.error('Error fetching products:', productsError);

    const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });
    
    if (servicesError) console.error('Error fetching services:', servicesError);

    const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .order('name', { ascending: true });

    if (providersError) console.error('Error fetching providers:', providersError);
    
    const { data: providerTypesData, error: providerTypesError } = await supabase
        .from('providers')
        .select('provider_type_code, provider_type_description')
        .not('provider_type_code', 'is', null);

    if (providerTypesError) console.error('Error fetching provider types:', providerTypesError);
    
    const { data: incomeVouchersData, error: incomeVouchersError } = await supabase
        .from('income_vouchers')
        .select('code, description')
        .order('code', { ascending: true });

    if (incomeVouchersError) console.error('Error fetching income vouchers:', incomeVouchersError);

    const { data: expenseVouchersData, error: expenseVouchersError } = await supabase
        .from('expense_vouchers')
        .select('code, description')
        .order('code', { ascending: true });

    if (expenseVouchersError) console.error('Error fetching expense vouchers:', expenseVouchersError);

    const { data: unitsOfMeasureData, error: unitsOfMeasureError } = await supabase.from('units_of_measure').select('*').order('code');
    if (unitsOfMeasureError) console.error('Error fetching units of measure:', unitsOfMeasureError);

    const { data: unitsOfTimeData, error: unitsOfTimeError } = await supabase.from('units_of_time').select('*').order('code');
    if (unitsOfTimeError) console.error('Error fetching units of time:', unitsOfTimeError);

    const { data: unitsOfMassData, error: unitsOfMassError } = await supabase.from('units_of_mass').select('*').order('code');
    if (unitsOfMassError) console.error('Error fetching units of mass:', unitsOfMassError);

    const { data: unitsOfVolumeData, error: unitsOfVolumeError } = await supabase.from('units_of_volume').select('*').order('code');
    if (unitsOfVolumeError) console.error('Error fetching units of volume:', unitsOfVolumeError);

    const { data: pointsOfSaleData, error: pointsOfSaleError } = await supabase.from('points_of_sale').select('*').order('code');
    if (pointsOfSaleError) console.error('Error fetching points of sale:', pointsOfSaleError);
    
    const { data: accountStatusesData, error: accountStatusesError } = await supabase.from('account_statuses').select('*').order('code');
    if (accountStatusesError) console.error('Error fetching account statuses:', accountStatusesError);

    const { data: currenciesData, error: currenciesError } = await supabase.from('currencies').select('*').order('code');
    if (currenciesError) console.error('Error fetching currencies:', currenciesError);

    const uniqueProviderTypesMap = new Map<string, ProviderType>();
    (providerTypesData || []).forEach(item => {
        if (item.provider_type_code && !uniqueProviderTypesMap.has(item.provider_type_code)) {
            uniqueProviderTypesMap.set(item.provider_type_code, {
                code: item.provider_type_code,
                description: item.provider_type_description || ''
            });
        }
    });
    const providerTypes = Array.from(uniqueProviderTypesMap.values()).sort((a, b) => a.code.localeCompare(b.code));

    const productCategories = Array.from(new Set((products || []).map(item => item.category))).sort();
    const productSubcategories = Array.from(new Set((products || []).map(item => item.subcategory).filter(Boolean) as string[])).sort();
    const serviceCategories = Array.from(new Set((services || []).map(item => item.category))).sort();
    
    const productColors = Array.from(new Set((products || []).map(item => item.color).filter(Boolean) as string[])).sort();
    const productSizes = Array.from(new Set((products || []).map(item => item.tamaño).filter(Boolean) as string[])).sort();
    const productDescriptions = Array.from(new Set((products || []).map(item => item.description).filter(Boolean) as string[])).sort();
    const serviceDescriptions = Array.from(new Set((services || []).map(item => item.description).filter(Boolean) as string[])).sort();


    return { 
        products: products || [], 
        services: services || [],
        providers: providers || [],
        providerTypes: providerTypes || [],
        incomeVouchers: (incomeVouchersData as IncomeVoucher[]) || [],
        expenseVouchers: (expenseVouchersData as ExpenseVoucher[]) || [],
        unitsOfMeasure: (unitsOfMeasureData as UnitOfMeasure[]) || [],
        unitsOfTime: (unitsOfTimeData as UnitOfTime[]) || [],
        unitsOfMass: (unitsOfMassData as UnitOfMass[]) || [],
        unitsOfVolume: (unitsOfVolumeData as UnitOfVolume[]) || [],
        pointsOfSale: (pointsOfSaleData as PointOfSale[]) || [],
        accountStatuses: (accountStatusesData as AccountStatus[]) || [],
        currencies: (currenciesData as Currency[]) || [],
        productCategories, 
        productSubcategories,
        serviceCategories,
        productColors,
        productSizes,
        productDescriptions,
        serviceDescriptions
    };
}


export default async function AuxTablesPage() {
    const data = await getData();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Gestión de Tablas Auxiliares</h1>
                    <p className="text-muted-foreground">Administra las categorías y otros atributos para tus productos y servicios.</p>
                </div>
            </div>
            <AuxTablesManager 
                products={data.products}
                services={data.services}
                providers={data.providers}
                providerTypes={data.providerTypes}
                incomeVouchers={data.incomeVouchers}
                expenseVouchers={data.expenseVouchers}
                unitsOfMeasure={data.unitsOfMeasure}
                unitsOfTime={data.unitsOfTime}
                unitsOfMass={data.unitsOfMass}
                unitsOfVolume={data.unitsOfVolume}
                pointsOfSale={data.pointsOfSale}
                accountStatuses={data.accountStatuses}
                currencies={data.currencies}
                productCategories={data.productCategories}
                productSubcategories={data.productSubcategories}
                serviceCategories={data.serviceCategories}
                productColors={data.productColors}
                productSizes={data.productSizes}
                productDescriptions={data.productDescriptions}
                serviceDescriptions={data.serviceDescriptions}
            />
        </div>
    )
}
