
'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to preprocess empty strings into null for optional fields
const emptyStringToNull = z.preprocess((val) => (val === "" ? null : val), z.string().optional().nullable());

const baseClientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido.'),
  last_name: z.string().min(1, 'El apellido es requerido.'),
  razon_social: emptyStringToNull,
  nombre_fantasia: emptyStringToNull,
  iva_condition: emptyStringToNull,
  document_type: emptyStringToNull,
  document_number: emptyStringToNull,
  price_list: emptyStringToNull,
  province: emptyStringToNull,
  address: emptyStringToNull,
  city: emptyStringToNull,
  postal_code: emptyStringToNull,
  phone: emptyStringToNull,
  mobile_phone: emptyStringToNull,
  email: z.preprocess((val) => (val === "" ? null : val), z.string().email('El email no es válido.').optional().nullable()),
  default_invoice_type: z.preprocess((val) => (val === "" ? null : val), z.enum(['A', 'B', 'C']).optional().nullable()),
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
