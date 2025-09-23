'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

const sellerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  last_name: z.string().min(1, 'El apellido es requerido.'),
  address: z.string().optional(),
  dni: z.string().optional(),
  phone: z.string().optional(),
  authorized_discount: z.coerce.number().optional(),
  cash_sale_commission: z.coerce.number().optional(),
  collection_commission: z.coerce.number().optional(),
});

export async function addSeller(prevState: any, formData: FormData) {
    const validatedFields = sellerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "No autorizado." };
    }

    const { error } = await supabase.from('sellers').insert({ ...validatedFields.data, updated_at: new Date().toISOString() });

    if (error) {
        return { message: `Error creando el vendedor: ${error.message}` };
    }

    revalidatePath('/admin/sellers');
    return {
        message: 'success',
        data: `Vendedor ${validatedFields.data.name} ${validatedFields.data.last_name} creado exitosamente.`,
    };
}


const updateSellerSchema = sellerSchema.extend({
    id: z.coerce.number(),
});

export async function updateSeller(prevState: any, formData: FormData) {
    const validatedFields = updateSellerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: "No autorizado." };
    }
    
    const { id, ...sellerData } = validatedFields.data;

    const { error } = await supabase.from('sellers').update({ ...sellerData, updated_at: new Date().toISOString() }).eq('id', id);

    if (error) {
        return { message: `Error al actualizar el vendedor: ${error.message}` };
    }

    revalidatePath('/admin/sellers');
    return {
        message: 'success',
        data: `Vendedor ${sellerData.name} ${sellerData.last_name} actualizado exitosamente.`,
    };
}

export async function deleteSeller(sellerId: number) {
    if (!sellerId) {
        return { message: "ID de vendedor inválido." };
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: 'No autenticado' };

    const { error } = await supabase.from('sellers').delete().eq('id', sellerId);

    if (error) {
        return { message: `Error al eliminar el vendedor: ${error.message}` };
    }

    revalidatePath('/admin/sellers');
    return { message: 'success', data: '¡Vendedor eliminado exitosamente!' };
}
