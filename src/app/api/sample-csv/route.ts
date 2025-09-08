// src/app/api/sample-csv/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = [
    'name,category,price,stock,available,description',
    'Monstera Deliciosa,Planta de interior,25.99,50,TRUE,"Una planta tropical popular con hojas grandes, perforadas."',
    'Pala de jardín,Herramienta,15.50,120,TRUE,Pala de acero resistente con mango de madera.',
    'Suculenta Echeveria,Suculenta,8.00,75,TRUE,',
    'Fertilizante Universal,Fertilizante,12.00,200,TRUE,"Abono completo para todo tipo de plantas."',
    'Maceta de Terracota,Maceta,10.50,80,FALSE,"20cm de diámetro, ideal para suculentas."',
    'Rosal trepador,Planta de exterior,35.00,30,TRUE,"Produce flores rojas fragantes durante todo el verano."',
    'Limonero,Planta frutal,45.00,15,TRUE,"Árbol frutal que produce limones todo el año."',
  ].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sample-products.csv"',
    },
  });
}
