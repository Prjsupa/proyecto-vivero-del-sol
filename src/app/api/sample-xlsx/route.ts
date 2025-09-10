
// src/app/api/sample-xlsx/route.ts

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const sampleData = [
    { name: 'Monstera Deliciosa', sku: 'PL-INT-001', category: 'Planta de interior', subcategory: 'Hojas grandes', price: 25990, stock: 50, available: true, description: 'Una planta tropical popular con hojas grandes, perforadas.' },
    { name: 'Pala de jardín', sku: 'HERR-MAN-001', category: 'Herramienta', subcategory: 'Manual', price: 15500, stock: 120, available: true, description: 'Pala de acero resistente con mango de madera.' },
    { name: 'Suculenta Echeveria', sku: 'SUC-ROS-001', category: 'Suculenta', subcategory: 'Roseta', price: 8000, stock: 75, available: true, description: '' },
    { name: 'Fertilizante Universal', sku: 'FERT-GRA-001', category: 'Fertilizante', subcategory: 'Granulado', price: 12000, stock: 200, available: true, description: 'Abono completo para todo tipo de plantas.' },
    { name: 'Maceta de Terracota', sku: 'MAC-20CM-001', category: 'Maceta', subcategory: '20cm', price: 10500, stock: 80, available: false, description: '20cm de diámetro, ideal para suculentas.' },
    { name: 'Rosal trepador', sku: 'PL-EXT-001', category: 'Planta de exterior', subcategory: 'Trepadoras', price: 35000, stock: 30, available: true, description: 'Produce flores rojas fragantes durante todo el verano.' },
    { name: 'Limonero', sku: 'PL-FRU-001', category: 'Planta frutal', subcategory: 'Cítricos', price: 45000, stock: 15, available: true, description: 'Árbol frutal que produce limones todo el año.' },
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Productos');

  // Define headers
  worksheet.columns = [
    { header: 'name', key: 'name', width: 30 },
    { header: 'sku', key: 'sku', width: 15 },
    { header: 'category', key: 'category', width: 20 },
    { header: 'subcategory', key: 'subcategory', width: 20 },
    { header: 'price', key: 'price', width: 10 },
    { header: 'stock', key: 'stock', width: 10 },
    { header: 'available', key: 'available', width: 10 },
    { header: 'description', key: 'description', width: 50 },
  ];

  // Add data
  worksheet.addRows(sampleData);

  // Style header
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="sample-products.xlsx"',
    },
  });
}
