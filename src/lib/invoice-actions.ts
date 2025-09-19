'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';

const createInvoiceSchema = z.object({
    clientId: z.coerce.number().optional(), // Optional because a new client can be created
    client_first_name: z.string().min(1, "El nombre del cliente es requerido."),
    client_last_name: z.string().min(1, "El apellido del cliente es requerido."),
    client_document_type: z.string().optional().nullable(),
    client_document_number: z.string().optional().nullable(),
    invoiceType: z.enum(['A', 'B', 'C'], { required_error: "Debes seleccionar un tipo de factura." }),
    payment_condition: z.string().min(1, 'Debes seleccionar una condición de venta'),
    cash_account_code: z.string().min(1, 'Debes seleccionar una cuenta de caja'),
    notes: z.string().optional(),
    products: z.string().min(1, "Debes añadir al menos un producto.").transform((val) => val ? JSON.parse(val) : []),
    vat_type: z.string(),
    vat_rate: z.coerce.number(),
    discounts_total: z.coerce.number(),
    promotions_applied: z.string().transform((val) => val ? JSON.parse(val) : []),
});

export async function createInvoice(prevState: any, formData: FormData) {
    const supabase = createClient();
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
        payment_condition,
        cash_account_code,
        notes, 
        products,
        client_first_name,
        client_last_name,
        vat_rate,
        vat_type,
        discounts_total,
        promotions_applied
    } = validatedFields.data;
    
    if (!products || products.length === 0) {
        return { message: "No se puede crear una factura sin productos." };
    }
    
    const subtotal = products.reduce((acc: number, p: any) => acc + (p.unitPrice * p.quantity), 0);
    const vat_amount = (subtotal - discounts_total) * (vat_rate / 100);
    const totalAmount = subtotal - discounts_total + vat_amount;
    
    const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_id: clientId,
        client_name: `${client_first_name} ${client_last_name}`,
        products: products,
        subtotal,
        discounts_total,
        vat_rate,
        vat_type,
        vat_amount,
        total_amount: totalAmount,
        invoice_type: invoiceType,
        payment_condition,
        cash_account_code,
        notes: notes,
        promotions_applied,
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
