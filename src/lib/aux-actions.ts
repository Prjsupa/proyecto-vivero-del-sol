
'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

// ============== PROVIDER TYPES =================

const providerTypeSchema = z.object({
  code: z.string().min(1, 'El código es requerido.'),
  description: z.string().min(1, 'La descripción es requerida.'),
});

export async function addProviderType(prevState: any, formData: FormData) {
    const validatedFields = providerTypeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { code, description } = validatedFields.data;
    
    // Verificar si ya existe un proveedor con este tipo
    const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('provider_type_code', code)
        .limit(1);
    
    if (existingProvider && existingProvider.length > 0) {
        return { message: `Error: El código '${code}' ya existe.` };
    }
    
    // Intentar crear en la tabla provider_types primero
    let { error } = await supabase
        .from('provider_types')
        .insert({ code, description });
    
    // Si la tabla no existe, usar el método alternativo
    if (error && error.code === '42P01') { // Table does not exist
        // Crear un registro temporal que no se muestre en la lista de proveedores
        const { error: insertError } = await supabase
            .from('providers')
            .insert({ 
                name: `__TYPE_PLACEHOLDER_${code}__`,
                provider_type_code: code,
                provider_type_description: description
            });
        
        if (insertError) {
            console.error('Error creating provider type:', insertError);
            return { message: `Error creando el tipo de proveedor: ${insertError.message}` };
        }
    } else if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return { message: `Error: El código '${code}' ya existe.` };
        }
        return { message: `Error creando el tipo de proveedor: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/providers');
    return {
        message: 'success',
        data: `Tipo de proveedor '${code}' creado exitosamente.`,
    };
}

const updateProviderTypeSchema = providerTypeSchema.extend({
    old_code: z.string(),
});

export async function updateProviderType(prevState: any, formData: FormData) {
    const validatedFields = updateProviderTypeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { old_code, code, description } = validatedFields.data;

    const { error } = await supabase
        .from('providers')
        .update({ provider_type_code: code, provider_type_description: description })
        .eq('provider_type_code', old_code);

    if (error) {
        return { message: `Error al actualizar los proveedores: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/providers');
    return {
        message: 'success',
        data: `El tipo '${old_code}' ha sido actualizado a '${code}' en todos los proveedores.`,
    };
}

export async function deleteProviderType(code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };

    // Primero intentar eliminar de la tabla provider_types si existe
    let { error } = await supabase
        .from('provider_types')
        .delete()
        .eq('code', code);
    
    // Si la tabla no existe o no se encontró el registro, eliminar placeholders
    if (error) {
        // Eliminar placeholders de la tabla providers
        const { error: deleteError } = await supabase
            .from('providers')
            .delete()
            .eq('provider_type_code', code)
            .or(`name.like.[TIPO]%,name.like.__TYPE_PLACEHOLDER_%`);
        
        if (deleteError) {
            return { message: `Error al eliminar el tipo de proveedor: ${deleteError.message}` };
        }
        
        // Desasociar el tipo de proveedores reales
        const { error: updateError } = await supabase
            .from('providers')
            .update({ provider_type_code: null, provider_type_description: null })
            .eq('provider_type_code', code);
        
        if (updateError) {
            return { message: `Error al desasociar el tipo de los proveedores: ${updateError.message}` };
        }
    }
    
    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/providers');
    return { message: 'success', data: '¡Tipo de proveedor eliminado exitosamente!' };
}

const assignProvidersSchema = z.object({
    provider_type_code: z.string().min(1, 'Debe seleccionar un tipo de proveedor.'),
    provider_ids: z.string().min(1, 'Debe seleccionar al menos un proveedor.').transform(val => val.split(',').filter(Boolean)),
});

export async function assignProvidersToType(prevState: any, formData: FormData) {
    const validatedFields = assignProvidersSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { provider_type_code, provider_ids } = validatedFields.data;
    
    // Obtener la descripción del tipo desde provider_types
    const { data: typeData } = await supabase
        .from('provider_types')
        .select('description')
        .eq('code', provider_type_code)
        .single();
    
    let provider_type_description = typeData?.description || '';
    
    // Fallback: buscar en providers si no se encuentra en provider_types
    if (!provider_type_description) {
        const { data: fallbackData } = await supabase
            .from('providers')
            .select('provider_type_description')
            .eq('provider_type_code', provider_type_code)
            .not('provider_type_description', 'is', null)
            .limit(1)
            .single();
        
        provider_type_description = fallbackData?.provider_type_description || '';
    }
    
    // Actualizar los proveedores seleccionados
    const { error } = await supabase
        .from('providers')
        .update({ 
            provider_type_code,
            provider_type_description,
            updated_at: new Date().toISOString()
        })
        .in('id', provider_ids.map(id => parseInt(id)));
    
    if (error) {
        return { message: `Error asignando proveedores al tipo: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    revalidatePath('/admin/providers');
    return {
        message: 'success',
        data: `Se asignaron ${provider_ids.length} proveedor(es) al tipo '${provider_type_code}' exitosamente.`,
    };
}

// ============== INCOME VOUCHERS =================

const incomeVoucherSchema = z.object({
  code: z.string().min(1, 'El código es requerido.'),
  description: z.string().min(1, 'La descripción es requerida.'),
});

export async function addIncomeVoucher(prevState: any, formData: FormData) {
    const validatedFields = incomeVoucherSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { code, description } = validatedFields.data;
    
    const { error } = await supabase
        .from('income_vouchers')
        .insert({ code, description });
    
    if (error) {
        if (error.code === '23505') { // Unique constraint violation for code
            return { message: `Error: El código de comprobante '${code}' ya existe.` };
        }
        return { message: `Error creando el comprobante: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return {
        message: 'success',
        data: `Comprobante '${code}' creado exitosamente.`,
    };
}

const updateIncomeVoucherSchema = incomeVoucherSchema.extend({
    old_code: z.string(),
});

export async function updateIncomeVoucher(prevState: any, formData: FormData) {
    const validatedFields = updateIncomeVoucherSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { old_code, code, description } = validatedFields.data;

    const { error } = await supabase
        .from('income_vouchers')
        .update({ code, description })
        .eq('code', old_code);

    if (error) {
         if (error.code === '23505') {
            return { message: `Error: El código de comprobante '${code}' ya existe.` };
        }
        return { message: `Error al actualizar el comprobante: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return {
        message: 'success',
        data: `El comprobante '${old_code}' ha sido actualizado a '${code}'.`,
    };
}

export async function deleteIncomeVoucher(code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };

    const { error } = await supabase
        .from('income_vouchers')
        .delete()
        .eq('code', code);
    
    if (error) {
        return { message: `Error al eliminar el comprobante: ${error.message}` };
    }
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Comprobante de ingreso eliminado!' };
}

// ============== EXPENSE VOUCHERS =================

const expenseVoucherSchema = z.object({
  code: z.string().min(1, 'El código es requerido.'),
  description: z.string().min(1, 'La descripción es requerida.'),
});

export async function addExpenseVoucher(prevState: any, formData: FormData) {
    const validatedFields = expenseVoucherSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { code, description } = validatedFields.data;
    
    const { error } = await supabase
        .from('expense_vouchers')
        .insert({ code, description });
    
    if (error) {
        if (error.code === '23505') { // Unique constraint violation for code
            return { message: `Error: El código de comprobante '${code}' ya existe.` };
        }
        return { message: `Error creando el comprobante: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return {
        message: 'success',
        data: `Comprobante de egreso '${code}' creado exitosamente.`,
    };
}

const updateExpenseVoucherSchema = expenseVoucherSchema.extend({
    old_code: z.string(),
});

export async function updateExpenseVoucher(prevState: any, formData: FormData) {
    const validatedFields = updateExpenseVoucherSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { old_code, code, description } = validatedFields.data;

    const { error } = await supabase
        .from('expense_vouchers')
        .update({ code, description })
        .eq('code', old_code);

    if (error) {
         if (error.code === '23505') {
            return { message: `Error: El código de comprobante '${code}' ya existe.` };
        }
        return { message: `Error al actualizar el comprobante: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return {
        message: 'success',
        data: `El comprobante de egreso '${old_code}' ha sido actualizado a '${code}'.`,
    };
}

export async function deleteExpenseVoucher(code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };

    const { error } = await supabase
        .from('expense_vouchers')
        .delete()
        .eq('code', code);
    
    if (error) {
        return { message: `Error al eliminar el comprobante: ${error.message}` };
    }
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Comprobante de egreso eliminado!' };
}

// ============== GENERIC UNIT HANDLERS =================

const genericUnitSchema = z.object({
  code: z.string().min(1, 'El código es requerido.'),
  description: z.string().min(1, 'La descripción es requerida.'),
});

const updateGenericUnitSchema = genericUnitSchema.extend({
    old_code: z.string(),
});

async function addGenericUnit(tableName: string, formData: FormData) {
    const validatedFields = genericUnitSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: "Datos inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { code, description } = validatedFields.data;
    const { error } = await supabase.from(tableName).insert({ code, description });
    
    if (error) {
        if (error.code === '23505') return { message: `Error: El código '${code}' ya existe.` };
        return { message: `Error creando la unidad: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `Unidad '${code}' creada exitosamente.` };
}

async function updateGenericUnit(tableName: string, formData: FormData) {
    const validatedFields = updateGenericUnitSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: "Datos inválidos.", errors: validatedFields.error.flatten().fieldErrors };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { old_code, code, description } = validatedFields.data;
    const { error } = await supabase.from(tableName).update({ code, description }).eq('code', old_code);

    if (error) {
         if (error.code === '23505') return { message: `Error: El código '${code}' ya existe.` };
        return { message: `Error al actualizar la unidad: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `La unidad '${old_code}' ha sido actualizada.` };
}

async function deleteGenericUnit(tableName: string, code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };

    const { error } = await supabase.from(tableName).delete().eq('code', code);
    if (error) return { message: `Error al eliminar la unidad: ${error.message}` };
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Unidad eliminada!' };
}

// Unit of Measure
export async function addUnitOfMeasure(prevState: any, formData: FormData) { return await addGenericUnit('units_of_measure', formData); }
export async function updateUnitOfMeasure(prevState: any, formData: FormData) { return await updateGenericUnit('units_of_measure', formData); }
export async function deleteUnitOfMeasure(code: string) { return await deleteGenericUnit('units_of_measure', code); }

// Unit of Time
export async function addUnitOfTime(prevState: any, formData: FormData) { return await addGenericUnit('units_of_time', formData); }
export async function updateUnitOfTime(prevState: any, formData: FormData) { return await updateGenericUnit('units_of_time', formData); }
export async function deleteUnitOfTime(code: string) { return await deleteGenericUnit('units_of_time', code); }

// Unit of Mass
export async function addUnitOfMass(prevState: any, formData: FormData) { return await addGenericUnit('units_of_mass', formData); }
export async function updateUnitOfMass(prevState: any, formData: FormData) { return await updateGenericUnit('units_of_mass', formData); }
export async function deleteUnitOfMass(code: string) { return await deleteGenericUnit('units_of_mass', code); }

// Unit of Volume
export async function addUnitOfVolume(prevState: any, formData: FormData) { return await addGenericUnit('units_of_volume', formData); }
export async function updateUnitOfVolume(prevState: any, formData: FormData) { return await updateGenericUnit('units_of_volume', formData); }
export async function deleteUnitOfVolume(code: string) { return await deleteGenericUnit('units_of_volume', code); }

// Point of Sale
export async function addPointOfSale(prevState: any, formData: FormData) { return await addGenericUnit('points_of_sale', formData); }
export async function updatePointOfSale(prevState: any, formData: FormData) { return await updateGenericUnit('points_of_sale', formData); }
export async function deletePointOfSale(code: string) { return await deleteGenericUnit('points_of_sale', code); }

// Account Status
export async function addAccountStatus(prevState: any, formData: FormData) { return await addGenericUnit('account_statuses', formData); }
export async function updateAccountStatus(prevState: any, formData: FormData) { return await updateGenericUnit('account_statuses', formData); }
export async function deleteAccountStatus(code: string) { return await deleteGenericUnit('account_statuses', code); }

// Currency
export async function addCurrency(prevState: any, formData: FormData) { return await addGenericUnit('currencies', formData); }
export async function updateCurrency(prevState: any, formData: FormData) { return await updateGenericUnit('currencies', formData); }
export async function deleteCurrency(code: string) { return await deleteGenericUnit('currencies', code); }

// Cash Account
const cashAccountSchema = z.object({
  code: z.string().min(1, 'El código es requerido.'),
  description: z.string().min(1, 'La descripción es requerida.'),
  account_type: z.string().optional().nullable(),
});
const updateCashAccountSchema = cashAccountSchema.extend({ old_code: z.string() });

export async function addCashAccount(prevState: any, formData: FormData) {
    const validatedFields = cashAccountSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: "Datos inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { error } = await supabase.from('cash_accounts').insert(validatedFields.data);
    
    if (error) {
        if (error.code === '23505') return { message: `Error: El código '${validatedFields.data.code}' ya existe.` };
        return { message: `Error creando la cuenta de caja: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `Cuenta de caja '${validatedFields.data.code}' creada exitosamente.` };
}

export async function updateCashAccount(prevState: any, formData: FormData) {
    const validatedFields = updateCashAccountSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) return { message: "Datos inválidos.", errors: validatedFields.error.flatten().fieldErrors };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "No autorizado." };

    const { old_code, ...updateData } = validatedFields.data;
    const { error } = await supabase.from('cash_accounts').update(updateData).eq('code', old_code);

    if (error) {
         if (error.code === '23505') return { message: `Error: El código '${updateData.code}' ya existe.` };
        return { message: `Error al actualizar la cuenta de caja: ${error.message}` };
    }

    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: `La cuenta de caja '${old_code}' ha sido actualizada.` };
}

export async function deleteCashAccount(code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };

    const { error } = await supabase.from('cash_accounts').delete().eq('code', code);
    if (error) return { message: `Error al eliminar la cuenta de caja: ${error.message}` };
    
    revalidatePath('/admin/aux-tables');
    return { message: 'success', data: '¡Cuenta de caja eliminada!' };
}
