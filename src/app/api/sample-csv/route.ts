
// src/app/api/sample-csv/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = [
    'name,sku,category,subcategory,precio_costo,precio_venta,stock,available,description,color,tamaño,proveedor',
    'Monstera Deliciosa,PL-INT-001,Planta de interior,Hojas grandes,18000,25990,50,TRUE,"Una planta tropical popular con hojas grandes, perforadas.",Verde,"60cm","Proveedor A"',
    'Pala de jardín,HERR-MAN-001,Herramienta,Manual,10000,15500,120,TRUE,Pala de acero resistente con mango de madera.,Plata,"Standard","Proveedor B"',
    'Suculenta Echeveria,SUC-ROS-001,Suculenta,Roseta,5000,8000,75,TRUE,,Violeta,"10cm","Proveedor A"',
    'Fertilizante Universal,FERT-GRA-001,Fertilizante,Granulado,8500,12000,200,TRUE,"Abono completo para todo tipo de plantas.",N/A,"1kg","Proveedor C"',
    'Maceta de Terracota,MAC-20CM-001,Maceta,20cm,7000,10500,80,FALSE,"20cm de diámetro, ideal para suculentas.",Terracota,"20cm","Proveedor D"',
    'Rosal trepador,PL-EXT-001,Planta de exterior,Trepadoras,25000,35000,30,TRUE,"Produce flores rojas fragantes durante todo el verano.",Rojo,"1 metro","Proveedor A"',
    'Limonero,PL-FRU-001,Planta frutal,Cítricos,30000,45000,15,TRUE,"Árbol frutal que produce limones todo el año.",Verde,"1.5 metros","Proveedor E"',
  ].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sample-products.csv"',
    },
  });
}
