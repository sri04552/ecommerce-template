import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp,
    ShoppingBag,
    IndianRupee,
    Clock,
    Package,
    ArrowUpRight,
    RotateCcw,
    Truck,
    CheckCircle2,
    BarChart3,
    Sparkles,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ metrics, trend, topProducts, recentOrders }) {
    const maxRevenue = Math.max(...trend.map((d) => d.revenue), 1000);

    return (
        <AdminLayout
            title="Sales & Business Analytics"
            subtitle="Real-time revenue performance, order metrics, fulfillment indicators and best sellers"
        >
            <Head title="Executive Dashboard - Admin" />

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Revenue
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <IndianRupee className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                        ₹{metrics?.total_revenue?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        This Month: <span className="font-semibold text-slate-700">₹{metrics?.month_revenue?.toLocaleString('en-IN') || 0}</span>
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Orders
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-brand-surface-accent text-brand-primary flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                        {metrics?.total_orders || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Today: <span className="font-semibold text-emerald-600">+{metrics?.today_orders || 0} new</span>
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Average Order Value (AOV)
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-brand-surface-accent text-brand-primary flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2 font-mono">
                        ₹{metrics?.aov?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Per completed checkout
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Action Required
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-600 font-mono">
                            {metrics?.pending_shipments || 0}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">pending ship</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Returns: <span className="font-semibold text-rose-600">{metrics?.pending_returns || 0} pending review</span>
                    </p>
                </div>
            </div>

            {/* 7-Day Revenue Trend Visual Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-brand-primary" />
                            <span>7-Day Revenue & Sales Velocity</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Daily commercial sales performance</p>
                    </div>
                    <span className="text-xs font-semibold text-brand-primary bg-brand-surface-accent border border-brand-primary/25 px-3 py-1 rounded-full">
                        Live Analytics
                    </span>
                </div>

                <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2">
                    {trend.map((day, idx) => {
                        const heightPct = Math.max(10, Math.round((day.revenue / maxRevenue) * 100));

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                                <span className="text-[10px] font-mono font-bold text-slate-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    ₹{Math.round(day.revenue)}
                                </span>
                                <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                                    <div
                                        style={{ height: `${heightPct}%` }}
                                        className="w-full bg-brand-primary hover:bg-brand-primary-hover rounded-t-lg transition-all duration-300"
                                        title={`${day.date}: ₹${day.revenue} (${day.orders} orders)`}
                                    />
                                </div>
                                <span className="text-[10px] font-medium text-slate-500 mt-2 truncate max-w-[65px] text-center">
                                    {day.date.split(',')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom 2 Columns: Top Selling Products & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Best Sellers Leaderboard */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Top Best-Selling Products</span>
                        </h3>
                        <Link href="/admin/products" className="text-xs text-brand-primary hover:underline font-semibold">
                            Catalog &rarr;
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {topProducts.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">No sales history recorded yet.</p>
                        ) : (
                            topProducts.map((p, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                            idx === 0 ? 'bg-amber-100 text-amber-800' :
                                            idx === 1 ? 'bg-slate-200 text-slate-700' :
                                            idx === 2 ? 'bg-orange-100 text-orange-800' :
                                            'bg-slate-50 text-slate-500'
                                        }`}>
                                            #{idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900">{p.product_name_snapshot}</p>
                                            <p className="text-[11px] text-slate-400">{p.total_sold} units sold</p>
                                        </div>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-slate-900">
                                        ₹{parseFloat(p.total_earned || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-brand-primary" />
                            <span>Recent Customer Orders</span>
                        </h3>
                        <Link href="/admin/orders" className="text-xs text-brand-primary hover:underline font-semibold">
                            View All &rarr;
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentOrders.length === 0 ? (
                            <p className="text-xs text-slate-400 py-6 text-center">No orders placed yet.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="py-3 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-xs text-slate-900">
                                                {order.order_number}
                                            </span>
                                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{order.customer_email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-bold text-xs text-slate-900">
                                            ₹{parseFloat(order.grand_total).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                                            {order.payment_method}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
