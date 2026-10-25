import { Head, router } from '@inertiajs/react';
import { Clock, Send, ShoppingCart, User, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';

export default function Index({ carts, stats }) {
    const cartList = carts?.data || [];

    const handleSendRecovery = (cartId) => {
        router.post(`/admin/abandoned-carts/${cartId}/send-recovery`, {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            title="Abandoned Cart Recovery"
            subtitle="Track customers who dropped off before checkout and send high-converting recovery reminders"
        >
            <Head title="Abandoned Carts - Admin" />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Abandoned Carts (&gt;1hr)
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                            {stats?.total_abandoned_count || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-200">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Potential Recoverable Revenue
                        </p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1 font-mono">
                            ₹{stats?.total_lost_value?.toLocaleString('en-IN') || 0}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-200">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Abandoned Carts Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">Cart ID</th>
                                <th className="py-3 px-4">Customer Contact</th>
                                <th className="py-3 px-4">Items in Cart</th>
                                <th className="py-3 px-4">Cart Value</th>
                                <th className="py-3 px-4">Last Activity</th>
                                <th className="py-3 px-4">Recovery Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {cartList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="font-medium text-slate-600">No abandoned carts right now.</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            When visitors leave items without completing checkout, they will appear here.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                cartList.map((cart) => {
                                    const email = cart.customer_email || cart.user?.email || 'Guest Visitor';
                                    const name = cart.customer_name || cart.user?.name || 'Unknown';
                                    const totalValue = cart.items?.reduce(
                                        (sum, i) => sum + parseFloat(i.unit_price) * parseInt(i.quantity),
                                        0
                                    ) || 0;

                                    return (
                                        <tr key={cart.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                                                #{cart.id}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-slate-900">{name}</p>
                                                <p className="text-slate-500 text-[11px] font-mono">{email}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-semibold text-slate-800">
                                                    {cart.items?.length || 0} products
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                                                ₹{totalValue.toFixed(2)}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                                {new Date(cart.updated_at).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {cart.recovery_mail_sent_at ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Reminder Sent</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Pending</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSendRecovery(cart.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    <span>Send Recovery</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
