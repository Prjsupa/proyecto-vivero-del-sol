
// src/app/api/sample-csv/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = [
    'name,sku,category,subcategory,price,stock,available,description',
    'Monstera Deliciosa,PL-INT-001,Planta de interior,Hojas grandes,25990,50,TRUE,"Una planta tropical popular con hojas grandes, perforadas."',
    'Pala de jardín,HERR-MAN-001,Herramienta,Manual,15500,120,TRUE,Pala de acero resistente con mango de madera.',
    'Suculenta Echeveria,SUC-ROS-001,Suculenta,Roseta,8000,75,TRUE,',
    'Fertilizante Universal,FERT-GRA-001,Fertilizante,Granulado,12000,200,TRUE,"Abono completo para todo tipo de plantas."',
    'Maceta de Terracota,MAC-20CM-001,Maceta,20cm,10500,80,FALSE,"20cm de diámetro, ideal para suculentas."',
    'Rosal trepador,PL-EXT-001,Planta de exterior,Trepadoras,35000,30,TRUE,"Produce flores rojas fragantes durante todo el verano."',
    'Limonero,PL-FRU-001,Planta frutal,Cítricos,45000,15,TRUE,"Árbol frutal que produce limones todo el año."',
  ].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sample-products.csv"',
    },
  });
}
