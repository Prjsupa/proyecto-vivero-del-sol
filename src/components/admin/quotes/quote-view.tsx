'use client';
import type { Quote, Json } from "@/lib/definitions";
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

type QuoteItem = {
    id: string;
    name: string;
    type: 'product' | 'service';
    unit_price: number;
    quantity: number;
    total: number;
};

type ResourceItem = {
    id: string;
    name: string;
    quantity: number;
    unitType: string;
    unitCode: string;
    cost: number;
}

export function QuoteView({ quote }: { quote: Quote }) {
    
    const items: QuoteItem[] = Array.isArray(quote.items) ? quote.items : [];
    const resources: ResourceItem[] = Array.isArray(quote.resources) ? quote.resources : [];
    
    return (
        <>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto border" id="quote-content">
                <header className="grid grid-cols-2 gap-8 items-start pb-6 border-b-2 border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Presupuesto</h1>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-gray-700">Presupuesto #{quote.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">Fecha: {format(new Date(quote.created_at), 'dd/MM/yyyy')}</p>
                    </div>
                </header>

                <section className="py-6 border-b border-gray-200 text-sm">
                     <p><span className="font-semibold w-28 inline-block">Cliente:</span>{quote.client_name}</p>
                     <p><span className="font-semibold w-28 inline-block">Asunto:</span>{quote.title}</p>
                </section>

                {items.length > 0 && (
                    <section className="py-6">
                        <h2 className="font-semibold uppercase text-gray-600 mb-2 text-sm">Artículos</h2>
                        <table className="w-full text-sm">
                            <thead className="border-b-2 border-gray-300 text-gray-600">
                                <tr>
                                    <th className="text-left font-semibold uppercase py-2 px-1">Descripción</th>
                                    <th className="text-center font-semibold uppercase py-2 px-1 w-[10%]">Cant.</th>
                                    <th className="text-right font-semibold uppercase py-2 px-1 w-[15%]">P. Unit.</th>
                                    <th className="text-right font-semibold uppercase py-2 px-1 w-[15%]">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 px-1">{item.name}</td>
                                    <td className="py-2 px-1 text-center">{item.quantity}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(item.unit_price, quote.currency)}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(item.total, quote.currency)}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {resources.length > 0 && (
                    <section className="py-6">
                        <h2 className="font-semibold uppercase text-gray-600 mb-2 text-sm">Recursos Adicionales</h2>
                         <table className="w-full text-sm">
                            <thead className="border-b-2 border-gray-300 text-gray-600">
                                <tr>
                                    <th className="text-left font-semibold uppercase py-2 px-1">Recurso</th>
                                    <th className="text-left font-semibold uppercase py-2 px-1">Detalle</th>
                                    <th className="text-right font-semibold uppercase py-2 px-1 w-[15%]">Costo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map((resource, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 px-1">{resource.name}</td>
                                    <td className="py-2 px-1">{resource.quantity} {resource.unitCode}</td>
                                    <td className="text-right py-2 px-1 font-mono">{formatPrice(resource.cost, quote.currency)}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                <div className="flex justify-end pt-6">
                    <div className="w-full max-w-sm text-right space-y-2 text-gray-700">
                        <div className="border-t border-gray-300 my-2"></div>
                        <div className="flex justify-between font-bold text-lg text-black">
                            <span>TOTAL ({quote.currency})</span>
                            <span className="font-mono">{formatPrice(quote.total_amount, quote.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #quote-page, #quote-page * {
                        visibility: visible;
                    }
                     #quote-page {
                        position: absolute;
                        left: 0;
                        top: 0;
                        right: 0;
                        height: auto;
                    }
                    #quote-content {
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
            Imprimir / Guardar PDF
        </Button>
    )
}
