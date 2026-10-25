import { useState } from 'react';
import { useForm, router, Head } from '@inertiajs/react';
import {
    Tag,
    Plus,
    Search,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Calendar,
    Users,
    Percent,
    IndianRupee,
    X,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';

export default function Index({ coupons, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const { data, setData, post, put, reset, errors, processing } = useForm({
        title: '',
        coupon_code: '',
        discount_type: 'percentage',
        discount_value: '',
        minimum_order_amount: '',
        max_discount_amount: '',
        usage_limit_total: '',
        starts_at: '',
        expires_at: '',
        is_active: true,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/coupons', { search: search.trim() }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingCoupon(null);
        reset();
        setData({
            title: '',
            coupon_code: '',
            discount_type: 'percentage',
            discount_value: '',
            minimum_order_amount: '',
            max_discount_amount: '',
            usage_limit_total: '',
            starts_at: '',
            expires_at: '',
            is_active: true,
        });
        setModalOpen(true);
    };

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon);
        setData({
            title: coupon.title,
            coupon_code: coupon.coupon_code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            minimum_order_amount: coupon.minimum_order_amount || '',
            max_discount_amount: coupon.max_discount_amount || '',
            usage_limit_total: coupon.usage_limit_total || '',
            starts_at: coupon.starts_at ? coupon.starts_at.substring(0, 10) : '',
            expires_at: coupon.expires_at ? coupon.expires_at.substring(0, 10) : '',
            is_active: coupon.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCoupon) {
            put(`/admin/coupons/${editingCoupon.id}`, {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/coupons', {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const toggleStatus = (coupon) => {
        router.post(`/admin/coupons/${coupon.id}/toggle-status`, {}, { preserveScroll: true });
    };

    const deleteCoupon = (coupon) => {
        if (confirm(`Are you sure you want to delete coupon code "${coupon.coupon_code}"?`)) {
            router.delete(`/admin/coupons/${coupon.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout
            title="Promotional Coupons & Offers"
            subtitle="Create and manage discount promo codes for customer carts and marketing campaigns"
            actions={
                <Button
                    onClick={openCreateModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-xs font-semibold py-2 px-3.5 rounded-lg shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Coupon</span>
                </Button>
            }
        >
            <Head title="Coupons & Discounts - Admin" />

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by coupon code or promotion campaign name..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                    </div>
                    <Button type="submit" variant="secondary" className="text-xs px-4 py-2">
                        Filter
                    </Button>
                </form>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">Coupon Code</th>
                                <th className="py-3 px-4">Campaign Title</th>
                                <th className="py-3 px-4">Discount</th>
                                <th className="py-3 px-4">Min. Spend</th>
                                <th className="py-3 px-4">Usage Limit</th>
                                <th className="py-3 px-4">Validity</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="font-medium text-slate-600">No promotional coupons created yet.</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Click "Create Coupon" to start your first discount offer.</p>
                                    </td>
                                </tr>
                            ) : (
                                coupons?.data?.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md">
                                                {coupon.coupon_code}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-900">{coupon.title}</td>
                                        <td className="py-3 px-4 font-semibold text-slate-900">
                                            {coupon.discount_type === 'percentage' ? (
                                                <span className="text-indigo-600 inline-flex items-center gap-0.5">
                                                    {coupon.discount_value}% OFF
                                                    {coupon.max_discount_amount && (
                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                            (Upto ₹{coupon.max_discount_amount})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600 font-mono">
                                                    ₹{coupon.discount_value} OFF
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600">
                                            {coupon.minimum_order_amount ? `₹${coupon.minimum_order_amount}` : 'None'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            <span className="font-medium text-slate-800">{coupon.used_count}</span>
                                            <span className="text-slate-400"> / {coupon.usage_limit_total || '∞'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-slate-500">
                                            {coupon.expires_at ? (
                                                <span>Exp: {new Date(coupon.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            ) : (
                                                <span className="text-emerald-600 font-medium">Never expires</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(coupon)}
                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                                    coupon.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                }`}
                                            >
                                                {coupon.is_active ? 'Active' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-1.5">
                                            <button
                                                onClick={() => openEditModal(coupon)}
                                                className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                title="Edit Coupon"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => deleteCoupon(coupon)}
                                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                title="Delete Coupon"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Coupon Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {editingCoupon ? 'Edit Promotional Coupon' : 'Create New Promotional Coupon'}
                                </h2>
                                <p className="text-xs text-slate-500">Configure discount parameters and eligibility criteria</p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title *</label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Diwali Mega Festival Savings"
                                    required
                                />
                                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                                    <Input
                                        value={data.coupon_code}
                                        onChange={(e) => setData('coupon_code', e.target.value.toUpperCase())}
                                        placeholder="FESTIVE20"
                                        className="uppercase font-mono font-bold"
                                        required
                                    />
                                    {errors.coupon_code && <p className="text-xs text-rose-500 mt-1">{errors.coupon_code}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type *</label>
                                    <select
                                        value={data.discount_type}
                                        onChange={(e) => setData('discount_type', e.target.value)}
                                        className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="percentage">Percentage Discount (%)</option>
                                        <option value="fixed_amount">Fixed Amount Discount (₹)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Discount Value ({data.discount_type === 'percentage' ? '%' : '₹'}) *
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.discount_value}
                                        onChange={(e) => setData('discount_value', e.target.value)}
                                        placeholder={data.discount_type === 'percentage' ? '15' : '150'}
                                        required
                                    />
                                    {errors.discount_value && <p className="text-xs text-rose-500 mt-1">{errors.discount_value}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Max Discount Cap (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.max_discount_amount}
                                        onChange={(e) => setData('max_discount_amount', e.target.value)}
                                        placeholder="e.g. 500"
                                    />
                                    <span className="text-[10px] text-slate-400">Optional cap for % discount</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Minimum Order Value (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.minimum_order_amount}
                                        onChange={(e) => setData('minimum_order_amount', e.target.value)}
                                        placeholder="e.g. 999"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Total Usage Limit
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.usage_limit_total}
                                        onChange={(e) => setData('usage_limit_total', e.target.value)}
                                        placeholder="e.g. 100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Starts At</label>
                                    <Input
                                        type="date"
                                        value={data.starts_at}
                                        onChange={(e) => setData('starts_at', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expires At</label>
                                    <Input
                                        type="date"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <span className="text-xs font-semibold text-slate-700">Coupon is Active</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setModalOpen(false)}
                                    className="text-xs px-4 py-2"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 py-2 font-semibold"
                                >
                                    {processing ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
