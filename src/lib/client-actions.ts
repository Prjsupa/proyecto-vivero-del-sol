
'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

const baseClientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  last_name: z.string().min(1, 'El apellido es requerido.'),
  razon_social: z.string().optional().transform(e => e === '' ? null : e),
  nombre_fantasia: z.string().optional().transform(e => e === '' ? null : e),
  iva_condition: z.string().optional().transform(e => e === '' ? null : e),
  document_type: z.string().optional().transform(e => e === '' ? null : e),
  document_number: z.string().optional().transform(e => e === '' ? null : e),
  price_list: z.string().optional().transform(e => e === '' ? null : e),
  province: z.string().optional().transform(e => e === '' ? null : e),
  address: z.string().optional().transform(e => e === '' ? null : e),
  city: z.string().optional().transform(e => e === '' ? null : e),
  postal_code: z.string().optional().transform(e => e === '' ? null : e),
  phone: z.string().optional().transform(e => e === '' ? null : e),
  mobile_phone: z.string().optional().transform(e => e === '' ? null : e),
  email: z.string().email('El email no es válido.').optional().or(z.literal('')).transform(e => e === '' ? null : e),
  default_invoice_type: z.enum(['A', 'B', 'C']).optional().nullable().transform(e => e === '' ? null : e),
  birth_date: z.preprocess((arg) => {
    if (!arg || arg === '') return null;
    try {
        const date = new Date(arg as string);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
  }, z.date().optional().nullable()),
});


const clientSchema = baseClientSchema.superRefine((data, ctx) => {
    if (data.document_type && data.document_type !== 'NN' && (!data.document_number || data.document_number.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El número de documento es requerido si se especifica un tipo.",
            path: ['document_number'],
        });
    }
});

const updateClientSchema = baseClientSchema.extend({
    id: z.coerce.number(),
}).superRefine((data, ctx) => {
    if (data.document_type && data.document_type !== 'NN' && (!data.document_number || data.document_number.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El número de documento es requerido si se especifica un tipo.",
            path: ['document_number'],
        });
    }
});


export async function addClient(prevState: any, formData: FormData) {
    const validatedFields = clientSchema.safeParse(Object.fromEntries(formData.entries()));

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
    
    const clientData = validatedFields.data;

    const { error } = await supabase
        .from('clients')
        .insert({ ...clientData, updated_at: new Date().toISOString() });

    if (error) {
        if(error.code === '23505') { // Unique constraint on document_number
            return { message: `Error: El número de documento '${validatedFields.data.document_number}' ya existe.` };
        }
        return { message: `Error creando el cliente: ${error.message}` };
    }

    revalidatePath('/admin/customers');
    return {
        message: 'success',
        data: `Cliente ${validatedFields.data.name} ${validatedFields.data.last_name} creado exitosamente.`,
    };
}

export async function updateClient(prevState: any, formData: FormData) {
    const validatedFields = updateClientSchema.safeParse(Object.fromEntries(formData.entries()));

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

    const { id, ...clientData } = validatedFields.data;
    
    const { error } = await supabase
        .from('clients')
        .update({ ...clientData, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        if(error.code === '23505') { // Unique constraint on document_number
            return { message: `Error: El número de documento '${clientData.document_number}' ya existe.` };
        }
        return { message: `Error al actualizar el cliente: ${error.message}` };
    }

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${id}`);
    return {
        message: 'success',
        data: `Cliente ${clientData.name} ${clientData.last_name} actualizado exitosamente.`,
    };
}
