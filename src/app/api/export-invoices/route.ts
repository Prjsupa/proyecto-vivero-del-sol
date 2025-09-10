
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/definitions';
import { format } from 'date-fns';

async function getInvoices(): Promise<Invoice[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
    return data;
}

export async function POST(request: Request) {
  const { invoiceIds } = await request.json();
  
  if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    return new NextResponse('No invoice IDs provided', { status: 400 });
  }
  
  const supabase = createClient();
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .in('id', invoiceIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices for export:', error);
    return new NextResponse('Failed to fetch invoices', { status: 500 });
  }


  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Facturas');

  // Define headers
  worksheet.columns = [
    { header: 'Nº Factura', key: 'invoice_number', width: 20 },
    { header: 'Fecha', key: 'created_at', width: 15 },
    { header: 'Cliente', key: 'client_name', width: 30 },
    { header: 'Tipo', key: 'invoice_type', width: 10 },
    { header: 'Monto Total', key: 'total_amount', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Método Pago Principal', key: 'payment_method', width: 20 },
    { header: 'Tipo Tarjeta', key: 'card_type', width: 15 },
    { header: 'Abono', key: 'has_secondary_payment', width: 10 },
    { header: 'Método Pago Secundario', key: 'secondary_payment_method', width: 25 },
    { header: 'Productos', key: 'products', width: 50 },
    { header: 'Notas', key: 'notes', width: 50 },
  ];
  
  worksheet.getRow(1).font = { bold: true };

  // Add data
  invoices.forEach(invoice => {
     const productsString = (invoice.products as any[]).map(p => `${p.quantity}x ${p.name}`).join(', ');

    worksheet.addRow({
      ...invoice,
      created_at: format(new Date(invoice.created_at), 'dd/MM/yyyy'),
      products: productsString,
      has_secondary_payment: invoice.has_secondary_payment ? 'Sí' : 'No',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `facturas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
