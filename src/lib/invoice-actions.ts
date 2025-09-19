'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const createInvoiceSchema = z.object({
    clientId: z.coerce.number().min(1, "Debes seleccionar un cliente."),
    invoiceType: z.enum(['A', 'B', 'C'], { required_error: "Debes seleccionar un tipo de factura." }),
    payment_method: z.string().optional(),
    card_type: z.string().optional(),
    has_secondary_payment: z.preprocess((val) => val === 'on' || val === true, z.boolean()),
    secondary_payment_method: z.string().optional(),
    secondary_card_type: z.string().optional(),
    notes: z.string().optional(),
    products: z.string().min(1, "Debes añadir al menos un producto.").transform((val) => val ? JSON.parse(val) : [])
});

export async function createInvoice(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedFields = createInvoiceSchema.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
        return {
            message: "Datos de formulario inválidos.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { 
        clientId, 
        invoiceType, 
        payment_method, 
        card_type,
        has_secondary_payment, 
        secondary_payment_method,
        secondary_card_type,
        notes, 
        products 
    } = validatedFields.data;
    
    if (!products || products.length === 0) {
        return { message: "No se puede crear una factura sin productos." };
    }

    const { data: clientData, error: clientError } = await supabase.from('clients').select('name, last_name').eq('id', clientId).single();
    if (clientError || !clientData) {
        return { message: "Cliente no encontrado." };
    }

    const totalAmount = products.reduce((acc: number, p: any) => acc + p.total, 0);

    const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_id: clientId,
        client_name: `${clientData.name} ${clientData.last_name}`,
        products: products,
        total_amount: totalAmount,
        invoice_type: invoiceType,
        payment_method: payment_method,
        card_type: card_type,
        has_secondary_payment: has_secondary_payment,
        secondary_payment_method: secondary_payment_method,
        secondary_card_type: secondary_card_type,
        notes: notes,
    };

    const { data, error } = await supabase.from('invoices').insert([invoiceData]).select('id').single();

    if (error) {
        console.error('Error creating invoice:', error);
        return { message: `Error al crear la factura: ${error.message}` };
    }
    
    revalidatePath('/admin/invoicing');
    revalidatePath('/admin/customers');
    
    return {
        message: 'success',
        data: data.id // Devuelve el ID de la factura creada
    };
}
