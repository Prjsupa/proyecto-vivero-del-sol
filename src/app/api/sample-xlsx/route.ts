
// src/app/api/sample-xlsx/route.ts

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const sampleData = [
    { name: 'Monstera Deliciosa', sku: 'PL-INT-001', category: 'Planta de interior', subcategory: 'Hojas grandes', precio_costo: 18000, precio_venta: 25990, stock: 50, available: true, description: 'Una planta tropical popular con hojas grandes, perforadas.', color: 'Verde', tamaño: '60cm', proveedor: 'Proveedor A' },
    { name: 'Pala de jardín', sku: 'HERR-MAN-001', category: 'Herramienta', subcategory: 'Manual', precio_costo: 10000, precio_venta: 15500, stock: 120, available: true, description: 'Pala de acero resistente con mango de madera.', color: 'Plata', tamaño: 'Standard', proveedor: 'Proveedor B' },
    { name: 'Suculenta Echeveria', sku: 'SUC-ROS-001', category: 'Suculenta', subcategory: 'Roseta', precio_costo: 5000, precio_venta: 8000, stock: 75, available: true, description: '', color: 'Violeta', tamaño: '10cm', proveedor: 'Proveedor A' },
    { name: 'Fertilizante Universal', sku: 'FERT-GRA-001', category: 'Fertilizante', subcategory: 'Granulado', precio_costo: 8500, precio_venta: 12000, stock: 200, available: true, description: 'Abono completo para todo tipo de plantas.', color: 'N/A', tamaño: '1kg', proveedor: 'Proveedor C' },
    { name: 'Maceta de Terracota', sku: 'MAC-20CM-001', category: 'Maceta', subcategory: '20cm', precio_costo: 7000, precio_venta: 10500, stock: 80, available: false, description: '20cm de diámetro, ideal para suculentas.', color: 'Terracota', tamaño: '20cm', proveedor: 'Proveedor D' },
    { name: 'Rosal trepador', sku: 'PL-EXT-001', category: 'Planta de exterior', subcategory: 'Trepadoras', precio_costo: 25000, precio_venta: 35000, stock: 30, available: true, description: 'Produce flores rojas fragantes durante todo el verano.', color: 'Rojo', tamaño: '1 metro', proveedor: 'Proveedor A' },
    { name: 'Limonero', sku: 'PL-FRU-001', category: 'Planta frutal', subcategory: 'Cítricos', precio_costo: 30000, precio_venta: 45000, stock: 15, available: true, description: 'Árbol frutal que produce limones todo el año.', color: 'Verde', tamaño: '1.5 metros', proveedor: 'Proveedor E' },
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Productos');

  // Define headers
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
