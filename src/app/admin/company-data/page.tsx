
import { createClient } from "@/lib/supabase/server";
import type { CompanyData } from "@/lib/definitions";
import { CompanyDataForm } from "@/components/admin/company-data-form";

async function getCompanyData(): Promise<CompanyData | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('company_data')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching company data:", error);
        return null;
    }

    return data;
}

export default async function CompanyDataPage() {
    const companyData = await getCompanyData();

    if (!companyData) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold">Datos de la Empresa</h1>
                <p className="text-muted-foreground">No se pudieron cargar los datos de la empresa. Asegúrate de que la tabla `company_data` exista y tenga una fila con id = 1.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Datos de la Empresa</h1>
                <p className="text-muted-foreground">Gestiona la información fiscal y de contacto de tu empresa.</p>
            </div>
            <CompanyDataForm companyData={companyData} />
        </div>
    );
}
