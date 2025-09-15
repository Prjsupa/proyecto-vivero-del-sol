
// src/app/api/export-inventory/route.ts

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/definitions';

async function getProducts(): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}

export async function GET() {
  const products = await getProducts();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventario');

  // Define headers
  worksheet.columns = [
    { header: 'Nombre', key: 'name', width: 35 },
    { header: 'SKU', key: 'sku', width: 20 },
    { header: 'Categoría', key: 'category', width: 20 },
    { header: 'Subcategoría', key: 'subcategory', width: 20 },
    { header: 'Color', key: 'color', width: 15 },
    { header: 'Tamaño', key: 'tamaño', width: 15 },
    { header: 'Proveedor', key: 'proveedor', width: 20 },
    { header: 'Precio Costo', key: 'precio_costo', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Precio Venta', key: 'precio_venta', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Rentabilidad', key: 'rentabilidad', width: 15, style: { numFmt: '0.00%' } },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Disponible', key: 'available', width: 12 },
    { header: 'Descripción', key: 'description', width: 50 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


  // Add data
  products.forEach(product => {
    let rentabilidad = 0;
    if (product.precio_costo > 0) {
      rentabilidad = (product.precio_venta - product.precio_costo) / product.precio_costo;
    }

    worksheet.addRow({
      name: product.name,
      sku: product.sku,
      category: product.category,
      subcategory: product.subcategory,
      color: product.color,
      tamaño: product.tamaño,
      proveedor: product.proveedor,
      precio_costo: product.precio_costo,
      precio_venta: product.precio_venta,
      rentabilidad: rentabilidad,
      stock: product.stock,
      available: product.available ? 'Sí' : 'No',
      description: product.description,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="inventario-vivero.xlsx"',
    },
  });
}
