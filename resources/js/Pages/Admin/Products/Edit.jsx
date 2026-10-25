import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Eye, Image as ImageIcon } from 'lucide-react';

export default function ProductEdit({ product, categories, brands }) {
    const primaryImage = product.images?.[0]?.url || '';

    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        base_price: product.base_price || '',
        sale_price: product.sale_price || '',
        cost_price: product.cost_price || '',
        allow_backorder: Boolean(product.allow_backorder),
        is_active: Boolean(product.is_active),
        is_featured: Boolean(product.is_featured),
        short_description: product.short_description || '',
        description: product.description || '',
        primary_image_url: primaryImage,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/products/${product.id}`);
    };

    return (
        <AdminLayout
            title={`Edit Product: ${product.name}`}
            subtitle="Update product pricing, attributes, and storefront visibility."
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        <span>View on Store</span>
                    </Link>
                    <Link
                        href="/admin/products"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                {/* General Information Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        General Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Product Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Slug (URL identifier) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                    required
                                />
                                {errors.slug && <p className="text-xs text-rose-500 mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    SKU <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white uppercase font-mono"
                                    required
                                />
                                {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="">Select a category</option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-xs text-rose-500 mt-1">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Brand
                                </label>
                                <select
                                    value={data.brand_id}
                                    onChange={(e) => setData('brand_id', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="">Select a brand</option>
                                    {brands?.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.brand_id && <p className="text-xs text-rose-500 mt-1">{errors.brand_id}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Short Summary
                            </label>
                            <input
                                type="text"
                                value={data.short_description}
                                onChange={(e) => setData('short_description', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.short_description && (
                                <p className="text-xs text-rose-500 mt-1">{errors.short_description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Description
                            </label>
                            <textarea
                                rows={5}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        Pricing & Policy
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Base Price (₹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.base_price}
                                onChange={(e) => setData('base_price', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                required
                            />
                            {errors.base_price && <p className="text-xs text-rose-500 mt-1">{errors.base_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Sale Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.sale_price}
                                onChange={(e) => setData('sale_price', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.sale_price && <p className="text-xs text-rose-500 mt-1">{errors.sale_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Cost Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.cost_price && <p className="text-xs text-rose-500 mt-1">{errors.cost_price}</p>}
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.allow_backorder}
                                onChange={(e) => setData('allow_backorder', e.target.checked)}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <span className="text-sm text-slate-700 font-medium">
                                Allow backorders when out of stock
                            </span>
                        </label>
                    </div>
                </div>

                {/* Media & Visibility Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        Media & Visibility
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Primary Image URL
                            </label>
                            <div className="relative">
                                <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="url"
                                    value={data.primary_image_url}
                                    onChange={(e) => setData('primary_image_url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            {errors.primary_image_url && (
                                <p className="text-xs text-rose-500 mt-1">{errors.primary_image_url}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <div>
                                    <span className="text-sm font-medium text-slate-800 block">Published / Active</span>
                                    <span className="text-xs text-slate-500">Visible to customers in the catalog</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                                <div>
                                    <span className="text-sm font-medium text-slate-800 block">Featured Product</span>
                                    <span className="text-xs text-slate-500">Showcased on storefront homepage</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
