'use client';
import type { Invoice, Client, CompanyData, Json, CashAccount } from "@/lib/definitions";
import { format, parseISO } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type InvoiceProductLine = {
    productId: string;
    name: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    manualDiscount: number;
    manualDiscountType: 'amount' | 'percentage';
    automaticDiscount: number;
    total: number;
    isService?: boolean;
}

type AppliedPromo = {
  name: string;
  amount: number;
};

export function InvoiceView({ invoice, client, company, cashAccounts }: { invoice: Invoice, client: Client | null, company: CompanyData | null, cashAccounts: CashAccount[] }) {
    
    const productLines: InvoiceProductLine[] = Array.isArray(invoice.products) ? invoice.products : [];
    
    const subtotal = invoice.subtotal || productLines.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    
    const clientVatCondition = invoice.vat_type ? (invoice.vat_type.replace('_', ' ')).replace(/\b\w/g, l => l.toUpperCase()) : 'Consumidor Final';

    const promotionsApplied: AppliedPromo[] = Array.isArray(invoice.promotions_applied) ? invoice.promotions_applied : [];
    const generalDiscount = invoice.general_discount_amount || 0;
    
    const allDiscounts = [...promotionsApplied];
    if (generalDiscount > 0) {
        allDiscounts.push({ name: 'Descuento General', amount: generalDiscount });
    }

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
                        <div className="text-sm text-gray-600 space-y-0.5">
                            <p className="font-bold text-base">{company?.razon_social || company?.nombre_fantasia || 'Vivero Del Sol'}</p>
                            <p>{company?.domicilio}</p>
                            <p>{company?.localidad}, {company?.provincia}</p>
                            <p>CUIT: {company?.cuit}</p>
                            <p>Cond. IVA: {company?.tipo_resp}</p>
                            <p>Ing. Brutos: {company?.ing_brutos}</p>
                            <p>Inicio de Actividades: {company?.inicio_activ}</p>
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
                    <div className="space-y-1">
                        <p><span className="font-semibold w-28 inline-block">Apellido y Nombre:</span>{invoice.client_name}</p>
                        <p><span className="font-semibold w-28 inline-block">Cond. Venta:</span>{invoice.payment_condition} {invoice.notes ? ` - ${invoice.notes}`: ''}</p>
                    </div>
                     <div className="space-y-1 text-right">
                        <p>
                            <span className="font-bold">{invoice.client_document_type || 'NN'}:</span> {invoice.client_document_number || 'No especificado'}
                        </p>
                        <p><span className="font-semibold">IVA:</span> {clientVatCondition}</p>
                    </div>
                </section>

                <section className="py-6">
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-gray-300 text-gray-600">
                            <tr>
                                <th className="text-left font-semibold uppercase py-2 px-1">Descripción</th>
                                <th className="text-center font-semibold uppercase py-2 px-1 w-[10%]">Cant.</th>
                                <th className="text-right font-semibold uppercase py-2 px-1 w-[15%]">P. Unit.</th>
                                <th className="text-right font-semibold uppercase py-2 px-1 w-[15%]">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                             {productLines.map((item, index) => {
                                const lineSubtotal = item.quantity * item.unitPrice;
                                return (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 px-1">{item.name}</td>
                                    <td className="py-2 px-1 text-center">{item.quantity}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(item.unitPrice, 'ARS')}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(lineSubtotal, 'ARS')}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     <div className="flex justify-end pt-6">
                        <div className="w-full max-w-sm text-right space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatPrice(subtotal, 'ARS')}</span>
                            </div>
                             {allDiscounts.length > 0 && (
                                <>
                                    {allDiscounts.map((promo, index) => (
                                        <div key={index} className="flex justify-between text-destructive">
                                            <span>{promo.name}</span>
                                            <span className="font-mono">- {formatPrice(promo.amount, 'ARS')}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {(invoice.vat_rate ?? 0) > 0 && (
                                <div className="flex justify-between">
                                    <span>IVA ({invoice.vat_rate}%)</span>
                                    <span className="font-mono">{formatPrice(invoice.vat_amount ?? 0, 'ARS')}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-300 my-2"></div>
                            <div className="flex justify-between font-bold text-lg text-black">
                                <span>TOTAL</span>
                                <span className="font-mono">{formatPrice(invoice.total_amount, 'ARS')}</span>
                            </div>
                        </div>
                    </div>
                </section>
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
                    margin: 0.5in;
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
