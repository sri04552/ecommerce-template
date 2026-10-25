import { Head, Link, usePage } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Card from '../../Components/ui/Card';
import Button from '../../Components/ui/Button';
import {
    ShoppingBag,
    Truck,
    Package,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Banknote,
} from 'lucide-react';

export default function CustomerOrders({ orders, categories = [] }) {
    const { storeSettings } = usePage().props;
    const currency = storeSettings?.currency_symbol || '₹';

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
            delivered: CheckCircle2,
            cancelled: XCircle,
        };

        const Icon = icons[status] || Clock;
        const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{status}</span>
            </span>
        );
    };

    return (
        <CustomerLayout
            title="My Orders"
            subtitle="Track live order status, view shipment updates, and request returns"
        >
            <Head title="My Orders" />

            <div className="space-y-4">
                {orders?.data?.length > 0 ? (
                    orders.data.map((order) => (
                        <Card key={order.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-sm text-indigo-600">
                                            {order.order_number}
                                        </span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Total Paid</p>
                                        <p className="font-bold text-sm text-slate-900">
                                            {currency}{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/track?order_number=${order.order_number}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
                                    >
                                        <span>Track Live</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Items overview */}
                            <div className="space-y-2">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs py-1">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span className="font-medium text-slate-800">{item.product_name}</span>
                                            <span className="text-slate-400">&times; {item.quantity}</span>
                                        </div>
                                        <span className="font-semibold text-slate-900">
                                            {currency}{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Refund Paid Badge / Notice */}
                            {order.returns?.[0]?.status === 'refunded' && (
                                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Refund Paid: {currency}{Number(order.returns[0].refund_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <span className="font-mono text-[11px] text-emerald-800 font-bold">
                                        UTR: {order.returns[0].refund_transaction_id}
                                    </span>
                                </div>
                            )}

                            {/* Payment and Courier Footer */}
                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                                <div className="flex items-center gap-2">
                                    {order.payment_method === 'cod' ? (
                                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                            <Banknote className="w-3 h-3" /> Cash on Delivery
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            <CreditCard className="w-3 h-3" /> Paid Online
                                        </span>
                                    )}
                                </div>

                                {order.shipments?.[0] && (
                                    <div className="flex items-center gap-1 text-indigo-600 font-mono font-medium">
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>{order.shipments[0].carrier_name}: {order.shipments[0].tracking_number}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-900 text-base">No Orders Placed Yet</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
                            You haven't placed any orders yet. Browse our curated store and discover top quality essentials.
                        </p>
                        <Link href="/products">
                            <Button variant="primary" size="md">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
