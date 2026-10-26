import { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Search,
    ShoppingBag,
    Eye,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    PackageCheck,
    CreditCard,
    Banknote,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function OrderIndex({ orders, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/orders', {
            search: search.trim() || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true });
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        router.get('/admin/orders', {
            search: search.trim() || undefined,
            status: status || undefined,
        }, { preserveState: true });
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
            processing: 'bg-brand-surface-accent text-brand-secondary border-brand-border',
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
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{status}</span>
            </span>
        );
    };

    return (
        <AdminLayout
            title="Customer Orders"
            subtitle="Monitor real-time customer purchases, tracking and return status"
        >
            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div
                        onClick={() => handleStatusChange('')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            !statusFilter ? 'bg-brand-surface-accent border-brand-primary ring-2 ring-brand-primary/20' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className="text-xs font-medium text-slate-500">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total || 0}</p>
                    </div>

                    <div
                        onClick={() => handleStatusChange('pending')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            statusFilter === 'pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className="text-xs font-medium text-amber-600">Pending</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{stats?.pending || 0}</p>
                    </div>

                    <div
                        onClick={() => handleStatusChange('confirmed')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            statusFilter === 'confirmed' ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className="text-xs font-medium text-sky-600">Confirmed</p>
                        <p className="text-2xl font-bold text-sky-700 mt-1">{stats?.confirmed || 0}</p>
                    </div>

                    <div
                        onClick={() => handleStatusChange('shipped')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            statusFilter === 'shipped' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className="text-xs font-medium text-purple-600">Shipped</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">{stats?.shipped || 0}</p>
                    </div>

                    <div
                        onClick={() => handleStatusChange('delivered')}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            statusFilter === 'delivered' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <p className="text-xs font-medium text-emerald-600">Delivered</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{stats?.delivered || 0}</p>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order #, email, phone..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                        {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                                key={status || 'all'}
                                type="button"
                                onClick={() => handleStatusChange(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                                    statusFilter === status
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {status || 'All Orders'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Order</th>
                                    <th className="py-3 px-4 font-semibold">Date</th>
                                    <th className="py-3 px-4 font-semibold">Customer</th>
                                    <th className="py-3 px-4 font-semibold">Items</th>
                                    <th className="py-3 px-4 font-semibold">Payment</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders?.data?.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-medium text-brand-primary">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="hover:underline flex items-center gap-1.5"
                                                >
                                                    <span>{order.order_number}</span>
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-medium text-slate-900">{order.customer_name || 'Guest Customer'}</div>
                                                <div className="text-xs text-slate-500">{order.customer_phone}</div>
                                                <div className="text-xs text-slate-400">{order.customer_email}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 text-xs">
                                                <span className="font-semibold text-slate-900">{order.items?.length || 0}</span> item(s)
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {order.payment_method === 'cod' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Banknote className="w-3 h-3" /> COD
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CreditCard className="w-3 h-3" /> Prepaid
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                                ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-surface-accent text-brand-secondary hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-slate-500">
                                            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">No orders found</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {search || statusFilter ? 'Try clearing your filters or search keywords.' : 'Orders placed by customers will appear here.'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders?.links?.length > 3 && (
                        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Showing {orders.from || 0} to {orders.to || 0} of {orders.total || 0} orders
                            </span>
                            <div className="flex items-center gap-1">
                                {orders.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-brand-primary text-white'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
