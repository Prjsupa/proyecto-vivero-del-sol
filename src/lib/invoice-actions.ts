
'use server';

import { z } from 'zod';
import { createClient } from './supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { applyPromotions } from './promotions-engine';

const createInvoiceSchema = z.object({
    clientId: z.coerce.number().optional(),
    client_first_name: z.string().min(1, "El nombre del cliente es requerido."),
    client_last_name: z.string().min(1, "El apellido del cliente es requerido."),
    client_document_type: z.string().optional().nullable(),
    client_document_number: z.string().optional().nullable(),
    invoiceType: z.enum(['A', 'B', 'C'], { required_error: "Debes seleccionar un tipo de factura." }),
    payment_condition: z.string().min(1, 'Debes seleccionar una condición de venta'),
    cash_account_code: z.string().optional().nullable(),
    notes: z.string().optional(),
    products: z.string().min(1, "Debes añadir al menos un producto.").transform((val) => val ? JSON.parse(val) : []),
    vat_type: z.string(),
    vat_rate: z.coerce.number(),
    seller_id: z.coerce.number().optional().nullable(),
    seller_commission: z.coerce.number().optional().nullable(),
    general_discount: z.coerce.number().optional().nullable(),
    general_discount_type: z.enum(['amount', 'percentage']).optional(),
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
        payment_condition,
        cash_account_code,
        notes, 
        products,
        client_first_name,
        client_last_name,
        client_document_type,
        client_document_number,
        vat_rate,
        vat_type,
        seller_id,
        seller_commission,
        general_discount,
        general_discount_type,
    } = validatedFields.data;
    
    if (!products || products.length === 0) {
        return { message: "No se puede crear una factura sin productos." };
    }
    
    let sellerName: string | undefined;
    if (seller_id) {
        const { data: sellerData } = await supabase.from('sellers').select('name, last_name').eq('id', seller_id).single();
        if (sellerData) {
            sellerName = `${sellerData.name} ${sellerData.last_name}`;
        }
    }

    const { lineDiscounts, appliedPromos } = await applyPromotions({
        supabase,
        items: products,
    });

    const subtotal = products.reduce((acc: number, p: any) => acc + (p.unitPrice * p.quantity), 0);
    
    const itemDiscounts = products.reduce((acc: number, p: any) => {
        const itemSubtotal = p.unitPrice * p.quantity;
        const manualDiscountAmount = p.manualDiscountType === 'percentage'
            ? itemSubtotal * ((p.manualDiscount || 0) / 100)
            : (p.manualDiscount || 0);
        
        const autoDiscount = lineDiscounts[p.productId] || 0;

        return acc + autoDiscount + manualDiscountAmount;
    }, 0);
    
    const generalDiscountAmount = general_discount_type === 'percentage'
        ? subtotal * ((general_discount || 0) / 100)
        : (general_discount || 0);

    const discounts_total = itemDiscounts + generalDiscountAmount;

    const vat_amount = (subtotal - discounts_total) * (vat_rate / 100);
    const totalAmount = subtotal - discounts_total + vat_amount;

    
    const combinedNotes = `${cash_account_code || ''}${notes ? (cash_account_code ? ' - ' : '') + notes : ''}`.trim();

    const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        client_id: clientId,
        client_name: `${client_first_name} ${client_last_name}`,
        client_document_type,
        client_document_number,
        products: products,
        subtotal,
        discounts_total,
        vat_rate,
        vat_type,
        vat_amount,
        total_amount: totalAmount,
        invoice_type: invoiceType,
        payment_condition,
        notes: combinedNotes || null,
        seller_id,
        seller_name: sellerName,
        seller_commission,
        promotions_applied: appliedPromos,
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
        data: data.id 
    };
}
