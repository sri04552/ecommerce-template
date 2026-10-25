import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function ProductCreate({ categories, brands }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        sku: '',
        category_id: '',
        brand_id: '',
        base_price: '',
        sale_price: '',
        cost_price: '',
        initial_stock: 0,
        allow_backorder: false,
        is_active: true,
        is_featured: false,
        short_description: '',
        description: '',
        primary_image_url: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/products');
    };

    return (
        <AdminLayout
            title="Create Product"
            subtitle="Add a new item to your store catalog."
            actions={
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Products</span>
                </Link>
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
                                placeholder="e.g. Minimalist Ceramic Cup"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Slug (URL identifier)
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="Leave blank to auto-generate"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                                {errors.slug && <p className="text-xs text-rose-500 mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    placeholder="e.g. CER-CUP-001"
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
                                placeholder="Brief 1-line product summary for card previews"
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
                                placeholder="Detailed product specifications, materials, and usage details..."
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Pricing & Inventory Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <h2 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        Pricing & Inventory
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Base Price ($) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.base_price}
                                onChange={(e) => setData('base_price', e.target.value)}
                                placeholder="29.99"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                required
                            />
                            {errors.base_price && <p className="text-xs text-rose-500 mt-1">{errors.base_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Sale Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.sale_price}
                                onChange={(e) => setData('sale_price', e.target.value)}
                                placeholder="Must be less than base price"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.sale_price && <p className="text-xs text-rose-500 mt-1">{errors.sale_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Cost Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                                placeholder="Internal cost of goods"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            {errors.cost_price && <p className="text-xs text-rose-500 mt-1">{errors.cost_price}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Initial Stock On Hand
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.initial_stock}
                                onChange={(e) => setData('initial_stock', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Creates an initial ledger transaction for the default variant.
                            </p>
                            {errors.initial_stock && (
                                <p className="text-xs text-rose-500 mt-1">{errors.initial_stock}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <input
                                id="allow_backorder"
                                type="checkbox"
                                checked={data.allow_backorder}
                                onChange={(e) => setData('allow_backorder', e.target.checked)}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <label htmlFor="allow_backorder" className="text-sm text-slate-700 font-medium">
                                Allow backorders when out of stock
                            </label>
                        </div>
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
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Enter a hosted image URL (e.g. Unsplash, S3, or CDN).
                            </p>
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
                        <span>{processing ? 'Saving...' : 'Create Product'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
