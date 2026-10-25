import { useState } from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    ShoppingBag,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    PackageCheck,
    CreditCard,
    Banknote,
    User,
    MapPin,
    RotateCcw,
    AlertCircle,
    Building2,
    QrCode,
    X,
} from 'lucide-react';

export default function OrderShow({ order, returns }) {
    const { data, setData, post, processing, errors } = useForm({
        status: order.status || 'pending',
        comment: '',
        courier_name: order.shipments?.[0]?.carrier_name || '',
        tracking_number: order.shipments?.[0]?.tracking_number || '',
        tracking_url: order.shipments?.[0]?.tracking_url || '',
    });

    const [returnProcessingId, setReturnProcessingId] = useState(null);
    const [refundModalReturn, setRefundModalReturn] = useState(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundUtr, setRefundUtr] = useState('');
    const [refundNote, setRefundNote] = useState('');
    const [refundSubmitting, setRefundSubmitting] = useState(false);

    const openRefundModal = (ret) => {
        setRefundModalReturn(ret);
        setRefundAmount(ret.item?.subtotal || order.total_amount);
        setRefundUtr('');
        setRefundNote('');
    };

    const handleProcessRefund = (e) => {
        e.preventDefault();
        if (!refundModalReturn || !refundUtr.trim()) return;
        setRefundSubmitting(true);

        post(`/admin/returns/${refundModalReturn.id}/process-refund`, {
            data: {
                refund_amount: parseFloat(refundAmount),
                refund_transaction_id: refundUtr.trim(),
                admin_notes: refundNote.trim() || undefined,
            },
            preserveScroll: true,
            onFinish: () => {
                setRefundSubmitting(false);
                setRefundModalReturn(null);
            },
        });
    };

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        post(`/admin/orders/${order.id}/update-status`, {
            preserveScroll: true,
        });
    };

    const handleReturnStatusUpdate = (returnId, newStatus) => {
        setReturnProcessingId(returnId);
        post(`/admin/returns/${returnId}/update-status`, {
            data: { status: newStatus },
            preserveScroll: true,
            onFinish: () => setReturnProcessingId(null),
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
            processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            shipped: 'bg-purple-50 text-purple-700 border-purple-200',
            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
        };

        const icons = {
            pending: Clock,
            confirmed: CheckCircle2,
            processing: ShoppingBag,
            shipped: Truck,
            delivered: PackageCheck,
            cancelled: XCircle,
        };

        const Icon = icons[status] || Clock;
        const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{status}</span>
            </span>
        );
    };

    const latestShipment = order.shipments?.[0];

    return (
        <AdminLayout
            title={`Order ${order.order_number}`}
            subtitle="View customer order items, update courier tracking and manage return requests"
            actions={
                <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Orders</span>
                </Link>
            }
        >
            <div className="space-y-6">
                {/* Header Summary Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-900 font-mono">{order.order_number}</h2>
                            {getStatusBadge(order.status)}
                            {order.payment_method === 'cod' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Banknote className="w-3.5 h-3.5" /> Cash on Delivery (COD)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CreditCard className="w-3.5 h-3.5" /> Prepaid Online
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Placed on {new Date(order.created_at).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Amount</p>
                        <p className="text-2xl font-black text-slate-900">
                            ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Order Items & Return Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ordered Items Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                                    <span>Items Ordered ({order.items?.length || 0})</span>
                                </h3>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.variant?.product?.image_url ? (
                                                <img
                                                    src={item.variant.product.image_url}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingBag className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 truncate">
                                                {item.product_name}
                                            </p>
                                            {item.variant_sku && (
                                                <p className="text-xs font-mono text-slate-400">SKU: {item.variant_sku}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                ₹{Number(item.unit_price).toLocaleString('en-IN')} &times; {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-slate-900">
                                                ₹{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-slate-50/70 p-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{Number(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping & Delivery Fee</span>
                                    <span>
                                        {Number(order.shipping_amount) > 0
                                            ? `₹${Number(order.shipping_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                            : 'Free'}
                                    </span>
                                </div>
                                {Number(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount</span>
                                        <span>-₹{Number(order.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                                    <span>Grand Total</span>
                                    <span>₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Return / Exchange Requests */}
                        {returns && returns.length > 0 && (
                            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-amber-50/60 border-b border-amber-200 flex items-center justify-between">
                                    <h3 className="font-semibold text-amber-900 text-sm flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4 text-amber-600" />
                                        <span>Customer Return / Exchange Requests ({returns.length})</span>
                                    </h3>
                                </div>

                                <div className="divide-y divide-amber-100 p-4 space-y-4">
                                    {returns.map((ret) => (
                                        <div key={ret.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                        {ret.type}
                                                    </span>
                                                    <span className="text-xs text-slate-500 ml-2">
                                                        Requested: {new Date(ret.created_at).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                                                    ret.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                    ret.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    ret.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {ret.status}
                                                </span>
                                            </div>

                                            <div className="text-xs text-slate-700">
                                                <p className="font-semibold">Reason:</p>
                                                <p className="text-slate-600 mt-0.5">{ret.reason}</p>
                                            </div>

                                            {/* Refund / Bank / UPI Details */}
                                            {ret.payout_details && (
                                                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                                                        {ret.refund_method === 'upi' ? (
                                                            <>
                                                                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                                                                <span>Customer Refund UPI ID</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                                                <span>Customer Bank Account Payout</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {ret.refund_method === 'upi' ? (
                                                        <p className="font-mono text-indigo-700 font-bold">{ret.payout_details.upi_id}</p>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-2 text-slate-700">
                                                            <p><span className="text-slate-500">Account Holder:</span> {ret.payout_details.account_holder}</p>
                                                            <p><span className="text-slate-500">Account No:</span> <span className="font-mono">{ret.payout_details.account_number}</span></p>
                                                            <p><span className="text-slate-500">IFSC Code:</span> <span className="font-mono">{ret.payout_details.ifsc_code}</span></p>
                                                            <p><span className="text-slate-500">Bank:</span> {ret.payout_details.bank_name}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Paid Refund Status Display */}
                                            {ret.status === 'refunded' ? (
                                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1 text-emerald-950">
                                                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        <span>Refund Paid & Verified: ₹{Number(ret.refund_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <p className="font-mono text-xs text-emerald-800">
                                                        Bank UTR / UPI Ref: <span className="font-bold">{ret.refund_transaction_id}</span>
                                                    </p>
                                                    {ret.refunded_at && (
                                                        <p className="text-[11px] text-emerald-600">
                                                            Processed on {new Date(ret.refunded_at).toLocaleString('en-IN')}
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] text-emerald-700 italic">
                                                        Automated notification sent to {order.customer_email}.
                                                    </p>
                                                </div>
                                            ) : (
                                                /* Admin Actions for Pending / Approved returns */
                                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRefundModal(ret)}
                                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                                                    >
                                                        <Banknote className="w-3.5 h-3.5" />
                                                        <span>Issue & Record Refund (Paid via UPI/Bank)</span>
                                                    </button>

                                                    {ret.status === 'requested' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReturnStatusUpdate(ret.id, 'approved')}
                                                                disabled={returnProcessingId === ret.id}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                            >
                                                                Approve Return
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReturnStatusUpdate(ret.id, 'rejected')}
                                                                disabled={returnProcessingId === ret.id}
                                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order Status History Timeline */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span>Order Activity History</span>
                            </h3>

                            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-2">
                                {order.histories?.map((history) => (
                                    <div key={history.id} className="relative">
                                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                                        <p className="text-xs font-bold text-slate-900 capitalize">
                                            Status: {history.status}
                                        </p>
                                        {history.comment && (
                                            <p className="text-xs text-slate-600 mt-0.5">{history.comment}</p>
                                        )}
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(history.created_at).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right 1 Col: Customer Details & Status / Tracking Updater */}
                    <div className="space-y-6">
                        {/* Fulfillment & Tracking Updater */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-indigo-600" />
                                <span>Update Order Status & Tracking</span>
                            </h3>

                            <form onSubmit={handleStatusUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Order Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Courier / Carrier Partner
                                    </label>
                                    <input
                                        type="text"
                                        value={data.courier_name}
                                        onChange={(e) => setData('courier_name', e.target.value)}
                                        placeholder="Delhivery, BlueDart, DTDC, India Post..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Tracking / AWB Number
                                    </label>
                                    <input
                                        type="text"
                                        value={data.tracking_number}
                                        onChange={(e) => setData('tracking_number', e.target.value)}
                                        placeholder="AWB123456789IN"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Courier Tracking URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={data.tracking_url}
                                        onChange={(e) => setData('tracking_url', e.target.value)}
                                        placeholder="https://www.delhivery.com/track/package/..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Status Note / Comment
                                    </label>
                                    <textarea
                                        value={data.comment}
                                        onChange={(e) => setData('comment', e.target.value)}
                                        rows={2}
                                        placeholder="Optional update note visible in history..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>{processing ? 'Saving...' : 'Save & Update Tracking'}</span>
                                </button>
                            </form>
                        </div>

                        {/* Customer & Delivery Address Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                <span>Customer & Delivery Details</span>
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">{order.customer_name || 'Customer'}</p>
                                    <p className="text-slate-500">{order.customer_phone}</p>
                                    <p className="text-slate-500">{order.customer_email}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="text-slate-700">
                                        <p className="font-semibold text-slate-900">Shipping Address</p>
                                        <p>{order.shipping_address?.street || order.shipping_address?.address_line_1 || 'Address'}</p>
                                        <p>
                                            {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Refund Modal */}
                {refundModalReturn && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Record & Issue Customer Refund</h3>
                                    <p className="text-xs text-slate-500">Order #{order.order_number}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRefundModalReturn(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleProcessRefund} className="mt-4 space-y-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                    <span className="font-bold text-slate-700 block">Transfer Destination:</span>
                                    {refundModalReturn.refund_method === 'upi' ? (
                                        <p className="font-mono text-indigo-700 font-bold">UPI: {refundModalReturn.payout_details?.upi_id}</p>
                                    ) : (
                                        <div className="text-slate-600 space-y-0.5">
                                            <p>A/C: <span className="font-mono font-bold text-slate-900">{refundModalReturn.payout_details?.account_number}</span></p>
                                            <p>IFSC: <span className="font-mono font-bold text-slate-900">{refundModalReturn.payout_details?.ifsc_code}</span> ({refundModalReturn.payout_details?.bank_name})</p>
                                            <p>Holder: {refundModalReturn.payout_details?.account_holder}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Refund Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Bank UTR / UPI Transaction Reference Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={refundUtr}
                                        onChange={(e) => setRefundUtr(e.target.value)}
                                        required
                                        placeholder="e.g. UPI/4294829104 or HDFC0001928374"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        This UTR number will be sent to the customer via email and displayed on their tracking screen so they can trace the bank credit.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Admin Notes / Remarks (Optional)
                                    </label>
                                    <textarea
                                        value={refundNote}
                                        onChange={(e) => setRefundNote(e.target.value)}
                                        rows={2}
                                        placeholder="Optional audit remarks..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setRefundModalReturn(null)}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={refundSubmitting}
                                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{refundSubmitting ? 'Recording & Notifying...' : 'Confirm Paid & Send Receipt'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
