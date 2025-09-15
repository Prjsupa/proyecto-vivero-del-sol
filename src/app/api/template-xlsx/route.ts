// src/app/api/template-xlsx/route.ts

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Productos');

  // Define headers only
  worksheet.columns = [
    { header: 'name', key: 'name', width: 30 },
    { header: 'sku', key: 'sku', width: 15 },
    { header: 'category', key: 'category', width: 20 },
    { header: 'subcategory', key: 'subcategory', width: 20 },
    { header: 'precio_costo', key: 'precio_costo', width: 10 },
    { header: 'precio_venta', key: 'precio_venta', width: 10 },
    { header: 'stock', key: 'stock', width: 10 },
    { header: 'available', key: 'available', width: 10 },
    { header: 'description', key: 'description', width: 50 },
    { header: 'color', key: 'color', width: 15 },
    { header: 'tamaño', key: 'tamaño', width: 15 },
    { header: 'proveedor', key: 'proveedor', width: 20 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-products.xlsx"',
    },
  });
}
