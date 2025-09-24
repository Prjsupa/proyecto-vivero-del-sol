
// src/app/api/export-invoices/route.ts

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/definitions';
import { format, parseISO } from 'date-fns';

async function getInvoices(invoiceIds: string[]): Promise<Invoice[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .in('id', invoiceIds)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }

    return data;
}

export async function POST(request: Request) {
    try {
        const { invoiceIds } = await request.json();
        
        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return NextResponse.json({ error: 'No invoice IDs provided' }, { status: 400 });
        }

        const invoices = await getInvoices(invoiceIds);

        if (invoices.length === 0) {
            return NextResponse.json({ error: 'No invoices found' }, { status: 404 });
        }

        // Crear el workbook de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Facturas');

        // Definir las columnas
        worksheet.columns = [
            { header: 'Número de Factura', key: 'invoice_number', width: 20 },
            { header: 'Fecha', key: 'created_at', width: 15 },
            { header: 'Cliente', key: 'client_name', width: 25 },
            { header: 'Tipo', key: 'invoice_type', width: 10 },
            { header: 'Condición de Venta', key: 'payment_condition', width: 20 },
            { header: 'Cuenta de Caja', key: 'cash_account', width: 20 },
            { header: 'Vendedor', key: 'seller_name', width: 20 },
            { header: 'Comisión (%)', key: 'seller_commission', width: 15 },
            { header: 'Sucursal', key: 'branch_name', width: 15 },
            { header: 'Subtotal', key: 'subtotal', width: 15 },
            { header: 'Descuentos Generales', key: 'general_discounts', width: 18 },
            { header: 'Promociones Aplicadas', key: 'promotions_applied', width: 25 },
            { header: 'Descuento Promociones', key: 'promotions_discount', width: 18 },
            { header: 'IVA', key: 'vat_amount', width: 15 },
            { header: 'Total', key: 'total_amount', width: 15 },
            { header: 'Notas', key: 'notes', width: 30 },
        ];

        // Agregar los datos
        invoices.forEach(invoice => {
            // Procesar promociones aplicadas
            let promotionsApplied = '';
            let promotionsDiscount = 0;
            
            if (invoice.promotions_applied) {
                try {
                    const promos = typeof invoice.promotions_applied === 'string' 
                        ? JSON.parse(invoice.promotions_applied) 
                        : invoice.promotions_applied;
                    
                    if (Array.isArray(promos) && promos.length > 0) {
                        promotionsApplied = promos.map(p => p.name).join(', ');
                        promotionsDiscount = promos.reduce((sum, p) => sum + (p.amount || 0), 0);
                    }
                } catch (error) {
                    console.error('Error parsing promotions:', error);
                }
            }

            // Extraer cuenta de caja de las notas (formato: "CUENTA - Otras notas")
            const notes = invoice.notes || '';
            const cashAccount = notes.includes(' - ') ? notes.split(' - ')[0] : notes;
            const otherNotes = notes.includes(' - ') ? notes.split(' - ').slice(1).join(' - ') : '';

            // Calcular descuentos generales (total de descuentos menos promociones)
            const totalDiscounts = invoice.discounts_total || 0;
            const generalDiscounts = totalDiscounts - promotionsDiscount;

            worksheet.addRow({
                invoice_number: invoice.invoice_number,
                created_at: format(parseISO(invoice.created_at), 'dd/MM/yyyy'),
                client_name: invoice.client_name,
                invoice_type: invoice.invoice_type,
                payment_condition: invoice.payment_condition,
                cash_account: cashAccount || '-',
                seller_name: invoice.seller_name || '-',
                seller_commission: invoice.seller_commission || '-',
                branch_name: invoice.branch_name || '-',
                subtotal: invoice.subtotal || 0,
                general_discounts: generalDiscounts > 0 ? generalDiscounts : '-',
                promotions_applied: promotionsApplied || '-',
                promotions_discount: promotionsDiscount > 0 ? promotionsDiscount : '-',
                vat_amount: invoice.vat_amount || 0,
                total_amount: invoice.total_amount,
                notes: otherNotes || '-',
            });
        });

        // Estilizar el header
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Generar el buffer del archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // Crear el nombre del archivo con timestamp
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        const filename = `facturas_${timestamp}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Error exporting invoices:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
