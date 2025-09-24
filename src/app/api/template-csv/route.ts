// src/app/api/template-csv/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = 'name,sku,category,subcategory,precio_costo,precio_venta,stock,available,description,color,tamaño,proveedor';

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="template-products.csv"',
    },
  });
}
