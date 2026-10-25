import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    Package,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowUpDown,
} from 'lucide-react';

export default function ProductsIndex({ products, categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [status, setStatus] = useState(filters?.status || '');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/admin/products',
            { search, category, status },
            { preserveState: true, replace: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        router.get('/admin/products', {}, { replace: true });
    };

    const handleToggleStatus = (productId) => {
        router.post(`/admin/products/${productId}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDelete = (productId, productName) => {
        if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            router.delete(`/admin/products/${productId}`);
        }
    };

    const getStockBadge = (stock) => {
        if (stock <= 0) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                    Out of Stock ({stock})
                </span>
            );
        }
        if (stock <= 5) {
            return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Low Stock ({stock})
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {stock} in stock
            </span>
        );
    };

    return (
        <AdminLayout
            title="Products"
            subtitle="Manage your catalog items, variants, pricing and storefront visibility."
            actions={
                <Link
                    href="/admin/products/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </Link>
            }
        >
            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by product title or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
                        >
                            <option value="">All Categories</option>
                            {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Filter
                        </button>
                        {(filters?.search || filters?.category || filters?.status) && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Products Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                {products?.data && products.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        SKU
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-3.5">
                                        Inventory
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-center">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {products.data.map((product) => {
                                    const primaryImage = product.primary_image?.image_path || product.images?.[0]?.url || product.primary_image_url;
                                    const totalStock = product.variants?.reduce(
                                        (sum, v) => sum + (v.inventory_level?.quantity_on_hand ?? v.inventoryLevel?.quantity_on_hand ?? 0),
                                        0
                                    ) ?? 0;

                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                                            {/* Product info & thumbnail */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                                        {primaryImage ? (
                                                            <img
                                                                src={primaryImage}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                            className="font-medium text-slate-900 hover:text-indigo-600 truncate block max-w-xs"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <span className="text-xs text-slate-400 block truncate">
                                                            /{product.slug}
                                                        </span>
                                                        {product.is_featured && (
                                                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* SKU */}
                                            <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                                {product.sku || '—'}
                                            </td>

                                            {/* Category */}
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4">
                                                {product.sale_price ? (
                                                    <div>
                                                        <span className="font-semibold text-slate-900 block">
                                                            ${Number(product.sale_price).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-slate-400 line-through">
                                                            ${Number(product.base_price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="font-semibold text-slate-900">
                                                        ${Number(product.base_price).toFixed(2)}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Inventory */}
                                            <td className="px-6 py-4">
                                                {getStockBadge(totalStock)}
                                            </td>

                                            {/* Status Toggle */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(product.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                                        product.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                                                    }`}
                                                    title="Click to toggle visibility"
                                                >
                                                    {product.is_active ? (
                                                        <>
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span>Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Draft</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Action buttons */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/products/${product.slug}`}
                                                        target="_blank"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                        title="View on storefront"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                        title="Edit product"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                                                        title="Delete product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800">No products found</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                            {filters?.search || filters?.category || filters?.status
                                ? 'No products matched your search or filter criteria.'
                                : 'Get started by creating your first product in the catalog.'}
                        </p>
                        <div className="mt-5">
                            <Link
                                href="/admin/products/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Product</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Pagination footer */}
                {products?.links && products.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                            Showing {products.from || 0} to {products.to || 0} of {products.total || 0} products
                        </span>
                        <div className="flex items-center gap-1">
                            {products.links.map((link, index) => (
                                <Link
                                    key={index}
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
        </AdminLayout>
    );
}
