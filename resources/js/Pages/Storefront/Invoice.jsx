import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import Button from '@/Components/ui/Button';

export default function Invoice({ order, taxBreakdown, categories }) {
    const shipping = order?.shipping_address_snapshot || {};
    const items = order?.items || [];

    const handlePrint = () => {
        window.print();
    };

    return (
        <StorefrontLayout categories={categories}>
            <Head title={`Tax Invoice ${order?.order_number}`} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Print & Action Controls (Hidden on Print) */}
                <div className="print:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-brand-border shadow-xs">
                    <Link
                        href={`/track?order_number=${order?.order_number}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Order Tracking</span>
                    </Link>

                    <Button
                        onClick={handlePrint}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Print / Save Tax Invoice (PDF)</span>
                    </Button>
                </div>

                {/* Printable Invoice Container */}
                <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm text-slate-800 print:border-none print:shadow-none print:p-0">
                    {/* Invoice Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-8 border-b border-slate-200 gap-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                                    TAX INVOICE
                                </span>
                                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    ORIGINAL FOR RECIPIENT
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Issued in accordance with Section 31 of CGST Act, 2017</p>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-sm font-semibold text-slate-900">
                                Invoice No: <span className="font-mono text-brand-primary">INV-{order?.order_number?.replace('ORD-', '')}</span>
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Order Reference: <span className="font-mono font-medium">{order?.order_number}</span>
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Invoice Date: {new Date(order?.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                                Place of Supply: <span className="font-semibold text-slate-900">{taxBreakdown?.place_of_supply}</span>
                            </p>
                        </div>
                    </div>

                    {/* Parties Section: Supplier & Buyer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs leading-relaxed">
                        <div>
                            <p className="font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-[11px] text-slate-500">
                                Sold By (Supplier)
                            </p>
                            <p className="font-bold text-sm text-slate-900">{config?.appName || 'Aura E-Commerce Store'}</p>
                            <p className="text-slate-600">Registered Office: Industrial Area, Phase II</p>
                            <p className="text-slate-600">State: {taxBreakdown?.supplier_state}, India</p>
                            <p className="text-slate-900 font-semibold mt-1">
                                GSTIN: <span className="font-mono text-brand-primary">{taxBreakdown?.supplier_gstin}</span>
                            </p>
                        </div>

                        <div>
                            <p className="font-bold text-slate-900 uppercase tracking-wider mb-1.5 text-[11px] text-slate-500">
                                Billing & Shipping Address (Buyer)
                            </p>
                            <p className="font-bold text-sm text-slate-900">{shipping?.full_name}</p>
                            <p className="text-slate-600">{shipping?.street_line1}</p>
                            <p className="text-slate-600">{shipping?.city}, {shipping?.state} - {shipping?.postal_code}</p>
                            <p className="text-slate-600">Phone: {shipping?.phone}</p>
                            <p className="text-slate-600">Email: {order?.customer_email}</p>
                        </div>
                    </div>

                    {/* Itemized Products Table */}
                    <div className="py-6 overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                    <th className="py-3 px-2">#</th>
                                    <th className="py-3 px-2">Description of Goods</th>
                                    <th className="py-3 px-2 text-center">HSN/SAC</th>
                                    <th className="py-3 px-2 text-center">Qty</th>
                                    <th className="py-3 px-2 text-right">Gross Price</th>
                                    <th className="py-3 px-2 text-right">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="text-slate-800">
                                        <td className="py-3.5 px-2 text-slate-500">{idx + 1}</td>
                                        <td className="py-3.5 px-2">
                                            <p className="font-semibold text-slate-900">{item.product_name_snapshot}</p>
                                            {item.sku_snapshot && (
                                                <p className="text-[11px] text-slate-500 font-mono">SKU: {item.sku_snapshot}</p>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-2 text-center font-mono text-slate-600">8517</td>
                                        <td className="py-3.5 px-2 text-center font-medium">{item.quantity}</td>
                                        <td className="py-3.5 px-2 text-right font-mono">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td className="py-3.5 px-2 text-right font-mono font-semibold">₹{parseFloat(item.total_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* GST Tax Calculation & Totals Grid */}
                    <div className="pt-4 border-t-2 border-slate-300 flex flex-col sm:flex-row justify-between gap-6 text-xs">
                        <div className="sm:max-w-xs space-y-2 text-slate-600">
                            <p className="font-bold text-slate-900 uppercase text-[11px]">Payment & Settlement</p>
                            <p>Payment Mode: <span className="font-semibold uppercase text-slate-900">{order?.payment_method}</span></p>
                            <p>Payment Status: <span className="font-semibold uppercase text-emerald-700">{order?.status}</span></p>
                            <p className="text-[11px] text-slate-500 leading-normal">
                                This computer-generated invoice includes Indian Goods & Services Tax (GST) calculated per applicable rate slabs.
                            </p>
                        </div>

                        <div className="w-full sm:w-80 space-y-2 border-t sm:border-t-0 pt-4 sm:pt-0">
                            <div className="flex justify-between text-slate-600">
                                <span>Item Subtotal:</span>
                                <span className="font-mono">₹{parseFloat(order?.subtotal).toFixed(2)}</span>
                            </div>

                            {parseFloat(order?.discount_total) > 0 && (
                                <div className="flex justify-between text-emerald-700 font-medium">
                                    <span>Promotional Discount:</span>
                                    <span className="font-mono">-₹{parseFloat(order?.discount_total).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-slate-600">
                                <span>Shipping / Delivery Fee:</span>
                                <span className="font-mono">
                                    {parseFloat(order?.shipping_total) === 0 ? 'FREE' : `₹${parseFloat(order?.shipping_total).toFixed(2)}`}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1.5 text-slate-600">
                                <div className="flex justify-between text-[11px]">
                                    <span>Taxable Value:</span>
                                    <span className="font-mono">₹{taxBreakdown?.taxable_amount?.toFixed(2)}</span>
                                </div>

                                {taxBreakdown?.is_intra_state ? (
                                    <>
                                        <div className="flex justify-between text-[11px]">
                                            <span>CGST (9.0%):</span>
                                            <span className="font-mono">₹{taxBreakdown?.cgst_amount?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span>SGST (9.0%):</span>
                                            <span className="font-mono">₹{taxBreakdown?.sgst_amount?.toFixed(2)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-[11px]">
                                        <span>IGST (18.0%):</span>
                                        <span className="font-mono">₹{taxBreakdown?.igst_amount?.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t-2 border-slate-900 pt-3 flex justify-between font-bold text-base text-slate-900">
                                <span>Grand Total:</span>
                                <span className="font-mono text-brand-primary">₹{parseFloat(order?.grand_total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Authorized Signatory Footnote */}
                    <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                            <span>Authorized Digital Signature & Verified Tax Documentation</span>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-900">For {config?.appName || 'Aura E-Commerce Store'}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Authorized Signatory</p>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
