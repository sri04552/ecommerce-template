import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
    Search,
    Truck,
    Package,
    CheckCircle2,
    XCircle,
    ShoppingBag,
    RotateCcw,
    CreditCard,
    Banknote,
    ExternalLink,
    AlertCircle,
    Building2,
    QrCode,
    X,
} from 'lucide-react';

export default function TrackOrder({ order, queriedOrderNumber, categories = [] }) {
    const { storeSettings } = usePage().props;
    const currency = storeSettings?.currency_symbol || '₹';

    const [orderNumberInput, setOrderNumberInput] = useState(queriedOrderNumber || '');
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [returnError, setReturnError] = useState(null);
    const [returnSuccess, setReturnSuccess] = useState(null);

    // Return Form state
    const [selectedItemId, setSelectedItemId] = useState(order?.items?.[0]?.id || '');
    const [returnType, setReturnType] = useState('return');
    const [reason, setReason] = useState('');
    const [refundMethod, setRefundMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [accountHolder, setAccountHolder] = useState(order?.customer_name || '');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (!orderNumberInput.trim()) return;
        router.get('/track', { order_number: orderNumberInput.trim() });
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        setReturnError(null);
        setSubmittingReturn(true);

        const payload = {
            order_item_id: selectedItemId || order?.items?.[0]?.id,
            type: returnType,
            reason: reason.trim(),
            refund_method: refundMethod === 'upi' ? 'upi' : 'bank_transfer',
            upi_id: refundMethod === 'upi' ? upiId : undefined,
            account_holder_name: refundMethod !== 'upi' ? accountHolder : undefined,
            account_number: refundMethod !== 'upi' ? accountNumber : undefined,
            ifsc_code: refundMethod !== 'upi' ? ifscCode : undefined,
            bank_name: refundMethod !== 'upi' ? bankName : undefined,
        };

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/orders/${order.id}/request-return`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setReturnSuccess(data.message || 'Your return request has been submitted successfully!');
                setTimeout(() => {
                    setReturnModalOpen(false);
                    setReturnSuccess(null);
                    router.reload();
                }, 2000);
            } else {
                setReturnError(data.message || 'Could not submit return request. Please try again.');
            }
        } catch (err) {
            setReturnError('An unexpected error occurred. Please try again.');
        } finally {
            setSubmittingReturn(false);
        }
    };

    // Tracking Step Progress calculation
    const steps = [
        { key: 'pending', label: 'Order Placed', desc: 'Received & logged' },
        { key: 'confirmed', label: 'Confirmed', desc: 'Verified by seller' },
        { key: 'processing', label: 'Processing', desc: 'Packed & ready' },
        { key: 'shipped', label: 'Shipped', desc: 'In courier transit' },
        { key: 'delivered', label: 'Delivered', desc: 'Delivered to you' },
    ];

    const getStepIndex = (status) => {
        switch (status) {
            case 'pending': return 0;
            case 'confirmed': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            case 'cancelled': return -1;
            default: return 0;
        }
    };

    const currentStepIdx = order ? getStepIndex(order.status) : 0;
    const latestShipment = order?.shipments?.[0];

    return (
        <StorefrontLayout categories={categories}>
            <Head title="Live Order Tracking" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Tracking Search Hero Card */}
                <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-xl text-center mb-8 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-xl mx-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/20 text-pink-300 border border-brand-primary/30 mb-3">
                            <Truck className="w-3.5 h-3.5" /> Real-time Tracking System
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Track Your Order Live
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 mt-2">
                            Enter your Order Number (e.g. <span className="font-mono text-pink-300">ORD-20261025-...</span>) received in your confirmation email or SMS.
                        </p>

                        <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={orderNumberInput}
                                    onChange={(e) => setOrderNumberInput(e.target.value)}
                                    placeholder="Enter your order number..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-brand-primary/30 shrink-0"
                            >
                                Track Now
                            </button>
                        </form>
                    </div>
                </div>

                {/* If Order Found */}
                {order ? (
                    <div className="space-y-6">
                        {/* Status Progress Timeline */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-slate-900 font-mono">
                                            {order.order_number}
                                        </h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-brand-surface-accent text-brand-primary'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ordered on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })} &bull; {order.customer_name}
                                    </p>
                                </div>

                                <div className="text-right sm:text-right">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total Value</p>
                                    <p className="text-xl font-black text-slate-900">
                                        {currency}{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* Stepper Progression */}
                            {order.status !== 'cancelled' ? (
                                <div className="py-8">
                                    <div className="relative">
                                        {/* Background Progress Bar */}
                                        <div className="absolute top-5 left-5 right-5 h-1 bg-slate-200 hidden sm:block -z-0">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-500"
                                                style={{ width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                                            {steps.map((step, idx) => {
                                                const isCompleted = idx <= currentStepIdx;
                                                const isCurrent = idx === currentStepIdx;

                                                return (
                                                    <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                                                isCompleted
                                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                            } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                                                        >
                                                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                {step.label}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-red-600 font-semibold text-sm">
                                    <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                                    This order was cancelled.
                                </div>
                            )}

                            {/* Courier Tracking Dispatch Details */}
                            {latestShipment && (
                                <div className="mt-4 p-4 rounded-xl bg-brand-surface-muted border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div>
                                        <p className="font-semibold text-brand-secondary flex items-center gap-1.5">
                                            <Truck className="w-4 h-4 text-brand-primary" />
                                            <span>Carrier Partner: {latestShipment.carrier_name || 'Standard Courier'}</span>
                                        </p>
                                        <p className="text-brand-text-muted font-mono mt-0.5">
                                            Tracking AWB: {latestShipment.tracking_number}
                                        </p>
                                    </div>

                                    {latestShipment.tracking_url && (
                                        <a
                                            href={latestShipment.tracking_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover transition-colors shadow-xs"
                                        >
                                            <span>Track with Courier</span>
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Processed Refunds & Return Status Card */}
                        {order.returns && order.returns.length > 0 && (
                            <div className="space-y-3">
                                {order.returns.map((ret) => (
                                    <div
                                        key={ret.id}
                                        className={`rounded-2xl p-5 border shadow-xs ${
                                            ret.status === 'refunded'
                                                ? 'bg-emerald-50/90 border-emerald-300'
                                                : 'bg-amber-50/80 border-amber-200'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5">
                                            <div className="flex items-center gap-2">
                                                {ret.status === 'refunded' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Refund Paid & Transferred</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span className="capitalize">{ret.type} {ret.status}</span>
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500">
                                                    Requested on {new Date(ret.created_at).toLocaleDateString('en-IN')}
                                                </span>
                                            </div>

                                            {ret.status === 'refunded' && (
                                                <div className="text-right">
                                                    <span className="text-[11px] text-emerald-800 font-semibold uppercase">Amount Paid:</span>
                                                    <span className="text-base sm:text-lg font-black text-emerald-950 ml-1">
                                                        {currency}{Number(ret.refund_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {ret.status === 'refunded' ? (
                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                                                    <p className="text-[11px] text-slate-500 font-medium">Bank UTR / UPI Ref ID</p>
                                                    <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 select-all">{ret.refund_transaction_id}</p>
                                                    <p className="text-[10px] text-slate-400">Verifiable in your bank statement or UPI app</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                                                    <p className="text-[11px] text-slate-500 font-medium">Credited To Account</p>
                                                    {ret.refund_method === 'upi' ? (
                                                        <p className="font-mono font-bold text-brand-primary">{ret.payout_details?.upi_id}</p>
                                                    ) : (
                                                        <p className="font-bold text-slate-800">
                                                            {ret.payout_details?.bank_name} &bull; A/C ending in {ret.payout_details?.account_number ? String(ret.payout_details.account_number).slice(-4) : '****'}
                                                        </p>
                                                    )}
                                                    {ret.refunded_at && (
                                                        <p className="text-[10px] text-slate-400">
                                                            Transferred at {new Date(ret.refunded_at).toLocaleString('en-IN')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-amber-900 mt-2">
                                                Reason: <span className="font-semibold">{ret.reason}</span>. Your return pickup is in progress. Refund will be credited to your {ret.refund_method?.toUpperCase()} account.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Order Items & Customer Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Items List (2 cols) */}
                            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-brand-primary" />
                                        <span>Ordered Products ({order.items?.length || 0})</span>
                                    </h3>

                                    {/* Return / Exchange Button */}
                                    <button
                                        type="button"
                                        onClick={() => setReturnModalOpen(true)}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Request Return / Exchange</span>
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="py-3 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                {item.variant?.product?.image_url ? (
                                                    <img
                                                        src={item.variant.product.image_url}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Qty: {item.quantity} &bull; {currency}{Number(item.unit_price).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="text-right font-bold text-xs sm:text-sm text-slate-900">
                                                {currency}{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping & Payment summary */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
                                <div>
                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                                        Delivery Address
                                    </h4>
                                    <p className="font-semibold text-slate-900">{order.customer_name}</p>
                                    <p className="text-slate-600 mt-0.5">{order.shipping_address?.street || order.shipping_address?.address_line_1}</p>
                                    <p className="text-slate-600">
                                        {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}
                                    </p>
                                    <p className="text-slate-500 mt-1">{order.customer_phone}</p>
                                </div>

                                <div className="pt-3 border-t border-slate-100">
                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                                        Payment Method
                                    </h4>
                                    {order.payment_method === 'cod' ? (
                                        <div className="flex items-center gap-2 text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                            <Banknote className="w-4 h-4 text-amber-600" />
                                            <span>Cash on Delivery (Pay upon delivery)</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                            <span>Paid Online</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : queriedOrderNumber ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">Order Not Found</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            We couldn't find an order with number <span className="font-mono font-semibold text-slate-800">"{queriedOrderNumber}"</span>. Please double-check your order number.
                        </p>
                    </div>
                ) : null}

                {/* Return / Exchange Modal with UPI / Bank Account Input */}
                {returnModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="w-5 h-5 text-brand-primary" />
                                    <h3 className="font-bold text-base text-slate-900">Request Return or Exchange</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReturnModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {returnSuccess ? (
                                <div className="py-8 text-center text-emerald-700">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                                    <p className="font-bold text-base">Request Submitted!</p>
                                    <p className="text-xs text-slate-600 mt-1">{returnSuccess}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleReturnSubmit} className="mt-4 space-y-4">
                                    {returnError && (
                                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{returnError}</span>
                                        </div>
                                    )}

                                    {/* Item select */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Select Product to Return / Exchange
                                        </label>
                                        <select
                                            value={selectedItemId}
                                            onChange={(e) => setSelectedItemId(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                        >
                                            {order.items?.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.product_name} ({currency}{item.unit_price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Action Type */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Resolution Preference
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setReturnType('return')}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                                                    returnType === 'return'
                                                        ? 'bg-brand-surface-accent border-brand-primary text-brand-primary ring-2 ring-brand-primary/20'
                                                        : 'bg-white border-slate-200 text-slate-700'
                                                }`}
                                            >
                                                Return & Refund
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setReturnType('exchange')}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                                                    returnType === 'exchange'
                                                        ? 'bg-brand-surface-accent border-brand-primary text-brand-primary ring-2 ring-brand-primary/20'
                                                        : 'bg-white border-slate-200 text-slate-700'
                                                }`}
                                            >
                                                Exchange Product
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Reason for Return / Exchange
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            required
                                            rows={2}
                                            placeholder="E.g., Size issue, damaged package, defective item..."
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>

                                    {/* Refund Payout Details Section */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-bold text-slate-900">
                                                Refund Payout Method (UPI / Bank Account)
                                            </label>
                                            <span className="text-[10px] text-brand-primary font-semibold uppercase">100% Secure</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            In compliance with our 3-Day Return Policy & Indian Consumer Protection Rules: provide your UPI ID or Bank Account where the refund should be deposited. A bank UTR reference receipt will be emailed to you immediately upon transfer.
                                        </p>

                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="refundMethod"
                                                    value="upi"
                                                    checked={refundMethod === 'upi'}
                                                    onChange={() => setRefundMethod('upi')}
                                                    className="text-brand-primary focus:ring-brand-primary"
                                                />
                                                <QrCode className="w-3.5 h-3.5 text-brand-primary" />
                                                <span>Instant UPI ID</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="refundMethod"
                                                    value="bank"
                                                    checked={refundMethod === 'bank'}
                                                    onChange={() => setRefundMethod('bank')}
                                                    className="text-brand-primary focus:ring-brand-primary"
                                                />
                                                <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                                                <span>Bank Account Transfer</span>
                                            </label>
                                        </div>

                                        {refundMethod === 'upi' ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value)}
                                                    required={refundMethod === 'upi'}
                                                    placeholder="e.g. mobile@paytm or name@oksbi"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-primary"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-[11px] text-slate-600 mb-0.5">Account Holder Name</label>
                                                    <input
                                                        type="text"
                                                        value={accountHolder}
                                                        onChange={(e) => setAccountHolder(e.target.value)}
                                                        required={refundMethod === 'bank'}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[11px] text-slate-600 mb-0.5">Account Number</label>
                                                        <input
                                                            type="text"
                                                            value={accountNumber}
                                                            onChange={(e) => setAccountNumber(e.target.value)}
                                                            required={refundMethod === 'bank'}
                                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] text-slate-600 mb-0.5">IFSC Code</label>
                                                        <input
                                                            type="text"
                                                            value={ifscCode}
                                                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                                            required={refundMethod === 'bank'}
                                                            placeholder="HDFC0001234"
                                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] text-slate-600 mb-0.5">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        value={bankName}
                                                        onChange={(e) => setBankName(e.target.value)}
                                                        required={refundMethod === 'bank'}
                                                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setReturnModalOpen(false)}
                                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingReturn}
                                            className="px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {submittingReturn ? 'Submitting...' : 'Submit Request'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
