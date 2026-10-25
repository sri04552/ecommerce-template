import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Warehouse,
    Search,
    AlertTriangle,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle,
    X,
    Save,
    RotateCcw,
} from 'lucide-react';

export default function InventoryIndex({ variants, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedVariant, setSelectedVariant] = useState(null);

    const adjustmentForm = useForm({
        type: 'adjust',
        quantity: 1,
        reason: '',
        reference: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/inventory', { search }, { preserveState: true, replace: true });
    };

    const openAdjustModal = (variant) => {
        setSelectedVariant(variant);
        adjustmentForm.setData({
            type: 'adjust',
            quantity: 1,
            reason: '',
            reference: '',
        });
    };

    const closeAdjustModal = () => {
        setSelectedVariant(null);
        adjustmentForm.reset();
    };

    const handleAdjustmentSubmit = (e) => {
        e.preventDefault();
        if (!selectedVariant) return;

        adjustmentForm.post(`/admin/inventory/${selectedVariant.id}/adjust`, {
            onSuccess: () => closeAdjustModal(),
        });
    };

    return (
        <AdminLayout
            title="Inventory & Stock Management"
            subtitle="Monitor stock on hand, reservations, reorder thresholds, and perform auditable adjustments."
        >
            {/* Search filter bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by product name, variant title, or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Search
                    </button>
                    {filters?.search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                router.get('/admin/inventory', {}, { replace: true });
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </form>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                {variants?.data && variants.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5">
                                        Item / Variant
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        SKU
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-center">
                                        On Hand
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-center">
                                        Reserved
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-center">
                                        Available
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-center">
                                        Backorder
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {variants.data.map((variant) => {
                                    const inv = variant.inventory_level || variant.inventoryLevel;
                                    const onHand = inv?.quantity_on_hand ?? 0;
                                    const reserved = inv?.reserved_quantity ?? 0;
                                    const available = onHand - reserved;
                                    const allowBackorder = variant.product?.allow_backorder;

                                    return (
                                        <tr key={variant.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Item */}
                                            <td className="px-6 py-4">
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-slate-900 block truncate">
                                                        {variant.product?.name || 'Untitled Product'}
                                                    </span>
                                                    <span className="text-xs text-slate-500 block">
                                                        Variant: {variant.title || 'Default'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* SKU */}
                                            <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                                {variant.sku}
                                            </td>

                                            {/* On Hand */}
                                            <td className="px-6 py-4 text-center font-semibold text-slate-800">
                                                {onHand}
                                            </td>

                                            {/* Reserved */}
                                            <td className="px-6 py-4 text-center text-slate-500">
                                                {reserved}
                                            </td>

                                            {/* Available */}
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        available > 5
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : available > 0
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}
                                                >
                                                    {available}
                                                </span>
                                            </td>

                                            {/* Backorder */}
                                            <td className="px-6 py-4 text-center">
                                                {allowBackorder ? (
                                                    <span className="text-xs text-indigo-600 font-medium">
                                                        Allowed
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        No
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openAdjustModal(variant)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Warehouse className="w-3.5 h-3.5" />
                                                    <span>Adjust Stock</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Warehouse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-slate-800">No inventory records found</h4>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            Product variants will appear here once products are created.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {variants?.links && variants.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Showing {variants.from || 0} to {variants.to || 0} of {variants.total || 0} items
                        </span>
                        <div className="flex items-center gap-1">
                            {variants.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                        link.active
                                            ? 'bg-indigo-600 text-white font-semibold'
                                            : !link.url
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Stock Adjustment Modal */}
            {selectedVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Adjust Inventory</h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    SKU: {selectedVariant.sku}
                                </p>
                            </div>
                            <button
                                onClick={closeAdjustModal}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Product:</span>
                                <span className="font-semibold text-slate-800">
                                    {selectedVariant.product?.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Current Stock On Hand:</span>
                                <span className="font-semibold text-indigo-600">
                                    {(selectedVariant.inventory_level || selectedVariant.inventoryLevel)?.quantity_on_hand ?? 0}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Adjustment Action <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={adjustmentForm.data.type}
                                    onChange={(e) => adjustmentForm.setData('type', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="adjust">Stock Count Correction / Manual Delta</option>
                                    <option value="receive">Stock Received from Supplier (+)</option>
                                    <option value="scrap">Damaged / Scrapped / Lost (-)</option>
                                    <option value="return">Customer Return (+)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Quantity Units <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={adjustmentForm.data.quantity}
                                    onChange={(e) =>
                                        adjustmentForm.setData('quantity', parseInt(e.target.value) || 0)
                                    }
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    required
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    For 'adjust', enter positive or negative integer. For receive/return/scrap, enter positive amount.
                                </p>
                                {adjustmentForm.errors.quantity && (
                                    <p className="text-xs text-rose-500 mt-1">
                                        {adjustmentForm.errors.quantity}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reason Note <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Annual audit count, supplier batch PO-102"
                                    value={adjustmentForm.data.reason}
                                    onChange={(e) => adjustmentForm.setData('reason', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    required
                                />
                                {adjustmentForm.errors.reason && (
                                    <p className="text-xs text-rose-500 mt-1">
                                        {adjustmentForm.errors.reason}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reference ID / PO Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. PO-98412"
                                    value={adjustmentForm.data.reference}
                                    onChange={(e) => adjustmentForm.setData('reference', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeAdjustModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustmentForm.processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>
                                        {adjustmentForm.processing ? 'Processing...' : 'Apply Adjustment'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
