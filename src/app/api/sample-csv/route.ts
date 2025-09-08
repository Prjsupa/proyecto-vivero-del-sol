// src/app/api/sample-csv/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = [
    'name,category,price,stock,available,description',
    'Monstera Deliciosa,Planta de interior,25990,50,TRUE,"Una planta tropical popular con hojas grandes, perforadas."',
    'Pala de jardín,Herramienta,15500,120,TRUE,Pala de acero resistente con mango de madera.',
    'Suculenta Echeveria,Suculenta,8000,75,TRUE,',
    'Fertilizante Universal,Fertilizante,12000,200,TRUE,"Abono completo para todo tipo de plantas."',
    'Maceta de Terracota,Maceta,10500,80,FALSE,"20cm de diámetro, ideal para suculentas."',
    'Rosal trepador,Planta de exterior,35000,30,TRUE,"Produce flores rojas fragantes durante todo el verano."',
    'Limonero,Planta frutal,45000,15,TRUE,"Árbol frutal que produce limones todo el año."',
  ].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sample-products.csv"',
    },
  });
}
