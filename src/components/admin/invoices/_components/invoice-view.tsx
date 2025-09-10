
'use client';
import type { Invoice, Profile } from "@/lib/definitions";
import { format, parseISO } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type ProductLine = {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export function InvoiceView({ invoice, clientProfile }: { invoice: Invoice, clientProfile: Profile | null }) {
    
    const productLines: ProductLine[] = Array.isArray(invoice.products) ? invoice.products : [];

    const viveroInfo = {
        name: 'Vivero Del Sol',
        address: 'Av. Siempre Viva 742',
        city: 'Springfield',
        cuit: '30-12345678-9',
        iva: 'Responsable Inscripto'
    };

    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto border" id="invoice-content">
                <header className="grid grid-cols-2 gap-8 items-start pb-6 border-b-2 border-gray-200">
                    <div className="flex flex-col items-start">
                         <Image 
                            src="https://fqkxbtahfsiebrphgzwg.supabase.co/storage/v1/object/public/vivero.logos/LOGOS_VERDE_Mesa_de_trabajo-1.png"
                            alt="Vivero Del Sol Logo"
                            width={200}
                            height={133}
                            className="mb-4"
                        />
                        <div className="text-sm text-gray-600">
                            <p className="font-bold">{viveroInfo.name}</p>
                            <p>{viveroInfo.address}</p>
                            <p>{viveroInfo.city}</p>
                            <p>CUIT: {viveroInfo.cuit}</p>
                             <p>Cond. IVA: {viveroInfo.iva}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-gray-100 p-2 inline-block rounded-md text-center border">
                            <p className="text-xl font-bold font-mono">FACTURA</p>
                            <div className="text-3xl font-bold font-mono text-primary">{invoice.invoice_type}</div>
                        </div>
                        <div className="mt-4 text-sm text-gray-700 space-y-1">
                            <p><span className="font-semibold">Nº:</span> {invoice.invoice_number}</p>
                            <p><span className="font-semibold">Fecha:</span> {format(parseISO(invoice.created_at), 'dd/MM/yyyy')}</p>
                        </div>
                    </div>
                </header>

                 <section className="grid grid-cols-2 gap-8 py-6 border-b border-gray-200 text-sm">
                    <div>
                        <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Cliente</h2>
                        <p className="font-bold">{invoice.client_name}</p>
                        {clientProfile && (
                            <>
                                <p>{clientProfile.address || 'Dirección no especificada'}</p>
                                <p>{clientProfile.city || ''} {clientProfile.province || ''}</p>
                                <p>CUIT/DNI: {clientProfile.cuit || 'No especificado'}</p>
                                <p>Cond. IVA: {clientProfile.iva_condition || 'Consumidor Final'}</p>
                            </>
                        )}
                    </div>
                     <div className="text-right">
                         <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Condiciones de Pago</h2>
                        <p className="font-bold">{invoice.payment_method || 'No especificado'}</p>
                         {invoice.card_type && <p>Tarjeta: {invoice.card_type}</p>}
                         {invoice.has_secondary_payment && <p>Abonado con: {invoice.secondary_payment_method} {invoice.secondary_card_type && `(${invoice.secondary_card_type})`}</p>}
                         {invoice.notes && <p className="text-xs italic mt-2">Notas: {invoice.notes}</p>}
                    </div>
                </section>

                <section className="py-6">
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-gray-300 text-gray-600">
                            <tr>
                                <th className="text-left font-semibold uppercase py-2 px-1 w-1/12">Cant.</th>
                                <th className="text-left font-semibold uppercase py-2 px-1 w-7/12">Descripción</th>
                                <th className="text-right font-semibold uppercase py-2 px-1 w-2/12">P. Unit.</th>
                                <th className="text-right font-semibold uppercase py-2 px-1 w-2/12">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productLines.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 px-1 text-center">{item.quantity}</td>
                                    <td className="py-2 px-1">{item.name}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(item.unitPrice)}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <footer className="flex justify-end pt-6 border-t-2 border-gray-200">
                     <div className="w-full max-w-xs text-right space-y-2 text-gray-700">
                        <div className="flex justify-between font-bold text-lg text-black">
                            <span>TOTAL</span>
                            <span className="font-mono">{formatPrice(invoice.total_amount)}</span>
                        </div>
                    </div>
                </footer>
            </div>
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #invoice-page, #invoice-page * {
                        visibility: visible;
                    }
                     #invoice-page {
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        height: auto;
                    }
                    #invoice-content {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        max-width: 100% !important;
                        width: 100%;
                    }
                }
                @page {
                    size: auto;
                    margin: 0;
                }
            `}</style>
        </>
    );
}

export function PrintButton() {
    const handlePrint = () => {
        window.print();
    };
    return (
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir / Guardar como PDF
        </Button>
    )
}
