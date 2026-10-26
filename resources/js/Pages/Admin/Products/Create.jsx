import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Plus,
    Upload,
    X,
    Tag,
    Percent,
    Sparkles,
    CheckCircle2,
    Loader2,
    Truck,
} from 'lucide-react';
import { optimizeImageToSquareWebP } from '../../../utils/imageOptimizer';

export default function ProductCreate({ categories, brands, selectedCategoryId }) {
    const searchParamCategory = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('category_id')
        : '';
    const initialCategory = selectedCategoryId ? String(selectedCategoryId) : (searchParamCategory || '');

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [offerType, setOfferType] = useState('none');
    const [customOffer, setCustomOffer] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        sku: '',
        category_id: initialCategory,
        brand_id: '',
        base_price: '',
        sale_price: '',
        delivery_fee: '',
        has_return_exchange: true,
        return_window_days: 3,
        cod_available: true,
        discount_percentage: '',
        offer_tag: '',
        cost_price: '',
        initial_stock: 0,
        allow_backorder: false,
        has_variants: false,
        variants: [],
        is_active: true,
        is_featured: false,
        short_description: '',
        description: '',
        primary_image_url: '',
        images: [],
    });

    const handleFileChange = async (e) => {
        const rawFiles = Array.from(e.target.files || []);
        if (rawFiles.length === 0) return;

        setIsOptimizing(true);
        try {
            const optimizedResults = await Promise.all(
                rawFiles.map((file) => optimizeImageToSquareWebP(file))
            );

            const newFiles = optimizedResults.map((r) => r.file);
            const newPreviews = optimizedResults.map((r) => ({
                name: r.file.name,
                size: `${r.sizeKb} KB (1:1)`,
                url: r.previewUrl,
            }));

            const updatedFiles = [...selectedFiles, ...newFiles];
            setSelectedFiles(updatedFiles);
            setData('images', updatedFiles);
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
        } catch (err) {
            console.error('Image optimization failed:', err);
            alert('Failed to process one or more images. Please ensure they are valid image files.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const removeFile = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        const updatedPreviews = previewUrls.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setPreviewUrls(updatedPreviews);
        setData('images', updatedFiles);
    };

    const handleBasePriceChange = (val) => {
        setData((prev) => {
            const base = parseFloat(val) || 0;
            const discount = parseFloat(prev.discount_percentage) || 0;
            let sale = prev.sale_price;
            if (discount > 0 && base > 0) {
                sale = Math.max(0, (base * (1 - discount / 100)).toFixed(2));
            }
            return { ...prev, base_price: val, sale_price: sale };
        });
    };

    const handleDiscountChange = (val) => {
        setData((prev) => {
            const discount = parseFloat(val) || 0;
            const base = parseFloat(prev.base_price) || 0;
            let sale = '';
            if (discount > 0 && base > 0) {
                sale = Math.max(0, (base * (1 - discount / 100)).toFixed(2));
            } else if (discount === 0) {
                sale = '';
            }
            return { ...prev, discount_percentage: val, sale_price: sale };
        });
    };

    const handleSalePriceChange = (val) => {
        setData((prev) => {
            const sale = parseFloat(val) || 0;
            const base = parseFloat(prev.base_price) || 0;
            let discount = '';
            if (base > 0 && sale > 0 && sale < base) {
                discount = Math.round(((base - sale) / base) * 100);
            }
            return { ...prev, sale_price: val, discount_percentage: discount };
        });
    };

    const applyQuickDiscount = (pct) => {
        handleDiscountChange(String(pct));
    };

    const handleOfferPresetChange = (preset) => {
        setOfferType(preset);
        if (preset === 'none') {
            setData('offer_tag', '');
        } else if (preset === 'custom') {
            setData('offer_tag', customOffer);
        } else {
            setData('offer_tag', preset);
        }
    };

    const handleCustomOfferChange = (val) => {
        setCustomOffer(val);
        setData('offer_tag', val);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isOptimizing) return;

        const payload = {
            name: data.name,
            sku: data.sku,
            category_id: data.category_id || '',
            brand_id: data.brand_id || '',
            base_price: data.base_price,
            sale_price: data.sale_price || '',
            delivery_fee: data.delivery_fee !== '' ? data.delivery_fee : 0,
            has_return_exchange: Boolean(data.has_return_exchange),
            return_window_days: data.return_window_days || 3,
            cod_available: Boolean(data.cod_available),
            discount_percentage: data.discount_percentage || '',
            offer_tag: data.offer_tag || '',
            cost_price: data.cost_price || '',
            initial_stock: data.initial_stock || 0,
            allow_backorder: Boolean(data.allow_backorder),
            has_variants: Boolean(data.has_variants),
            variants: data.variants || [],
            is_active: Boolean(data.is_active),
            is_featured: Boolean(data.is_featured),
            short_description: data.short_description || '',
            description: data.description || '',
        };

        if (selectedFiles && selectedFiles.length > 0) {
            payload.images = selectedFiles;
        }

        if (data.primary_image_url && !data.primary_image_url.startsWith('data:')) {
            payload.primary_image_url = data.primary_image_url;
        }

        router.post('/admin/products', payload, {
            forceFormData: Boolean(selectedFiles && selectedFiles.length > 0),
        });
    };

    const baseNum = parseFloat(data.base_price) || 0;
    const saleNum = parseFloat(data.sale_price) || 0;
    const customerSavings = baseNum > 0 && saleNum > 0 && saleNum < baseNum ? (baseNum - saleNum).toFixed(2) : 0;

    return (
        <AdminLayout
            title="Create Product"
            subtitle="Add a new item to your store catalog with auto-optimized 1:1 images, custom delivery fees, and deals."
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
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl" encType="multipart/form-data">
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
                                placeholder="e.g. Wireless Noise Cancelling Headphones"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
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
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
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
                                    placeholder="e.g. AUDIO-WNC-01"
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white uppercase font-mono"
                                    required
                                />
                                {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Category
                                    </label>
                                    <Link
                                        href="/admin/categories"
                                        target="_blank"
                                        className="text-xs text-brand-primary hover:text-brand-secondary font-semibold flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Create Category</span>
                                    </Link>
                                </div>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
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
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
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
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
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
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Detailed product specifications, materials, and usage details..."
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                            />
                            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Pricing, Discounts, Delivery & Offers Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-brand-primary" />
                            <h2 className="text-base font-semibold text-slate-900">
                                Pricing, Discounts & Delivery
                            </h2>
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Deals
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Base / MRP (â‚¹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.base_price}
                                onChange={(e) => handleBasePriceChange(e.target.value)}
                                placeholder="1999.00"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white font-medium"
                                required
                            />
                            {errors.base_price && <p className="text-xs text-rose-500 mt-1">{errors.base_price}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700">
                                    Discount (%)
                                </label>
                                <span className="text-[11px] text-slate-400">Optional</span>
                            </div>
                            <div className="relative">
                                <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    value={data.discount_percentage}
                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white font-medium"
                                />
                            </div>
                            {errors.discount_percentage && <p className="text-xs text-rose-500 mt-1">{errors.discount_percentage}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Final Sale Price (â‚¹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.sale_price}
                                onChange={(e) => handleSalePriceChange(e.target.value)}
                                placeholder="Auto-calculated or enter"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white font-semibold text-emerald-700"
                            />
                            {errors.sale_price && <p className="text-xs text-rose-500 mt-1">{errors.sale_price}</p>}
                        </div>
                    </div>

                    {/* Quick Discount Presets & Savings Pill */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-medium text-slate-600 mr-1">Quick Discount:</span>
                            {[10, 20, 30, 40, 50, 70].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => applyQuickDiscount(pct)}
                                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:border-brand-primary hover:text-brand-primary transition-colors shadow-2xs"
                                >
                                    {pct}% OFF
                                </button>
                            ))}
                        </div>

                        {customerSavings > 0 && (
                            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Customer saves â‚¹{customerSavings} ({data.discount_percentage}% OFF)</span>
                            </div>
                        )}
                    </div>

                    {/* Delivery Fee & Special Offer Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 mb-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    <span>Delivery Fee (â‚¹)</span>
                                </label>
                                <span className="text-[11px] text-emerald-600 font-semibold">0 = Free Delivery</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.delivery_fee}
                                onChange={(e) => setData('delivery_fee', e.target.value)}
                                placeholder="0.00 (Leave blank or 0 for Free Delivery)"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                If 0 or blank, checkout charges â‚¹0 delivery. If entered, this exact fee is applied.
                            </p>
                            {errors.delivery_fee && <p className="text-xs text-rose-500 mt-1">{errors.delivery_fee}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Special Offer Badge / Deal Tag
                            </label>
                            <select
                                value={offerType}
                                onChange={(e) => handleOfferPresetChange(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                            >
                                <option value="none">No Offer Badge</option>
                                <option value="Deal of the Day">Deal of the Day</option>
                                <option value="Limited Time Deal">Limited Time Deal</option>
                                <option value="Festive Offer">Festive Offer</option>
                                <option value="Clearance Sale">Clearance Sale</option>
                                <option value="Special Offer">Special Offer</option>
                                <option value="custom">Custom Offer Tag...</option>
                            </select>

                            {offerType === 'custom' && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={customOffer}
                                        onChange={(e) => handleCustomOfferChange(e.target.value)}
                                        placeholder="e.g. Super Saver, Flat â‚¹500 Off"
                                        maxLength={40}
                                        className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white font-medium"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Cost Price (â‚¹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                                placeholder="Internal cost for profit margins"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                            />
                            {errors.cost_price && <p className="text-xs text-rose-500 mt-1">{errors.cost_price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Initial Stock On Hand
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.initial_stock}
                                onChange={(e) => setData('initial_stock', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                            />
                            {errors.initial_stock && <p className="text-xs text-rose-500 mt-1">{errors.initial_stock}</p>}
                        </div>
                    </div>

                    <div className="pt-3">
                        <label className="flex items-center gap-3">
                            <input
                                id="allow_backorder"
                                type="checkbox"
                                checked={data.allow_backorder}
                                onChange={(e) => setData('allow_backorder', e.target.checked)}
                                className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
                            />
                            <span className="text-sm text-slate-700 font-medium">
                                Allow backorders when out of stock
                            </span>
                        </label>
                    </div>

                    {/* Product Variants Matrix (Size / Color Options) */}
                    <div className="pt-5 mt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Product Variants (Sizes, Colors, Styles)
                                </h3>
                                <p className="text-xs text-slate-500">Enable if this product comes in multiple selectable options</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.has_variants}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setData('has_variants', checked);
                                        if (checked && (!data.variants || data.variants.length === 0)) {
                                            setData('variants', [
                                                { title: 'Standard / Default', sku: `${data.sku || 'SKU'}-S`, price: data.base_price || '', stock: 20 },
                                            ]);
                                        }
                                    }}
                                    className="rounded border-slate-300 text-brand-primary focus:ring-brand-primary w-4 h-4"
                                />
                                <span className="text-xs font-bold text-slate-800">Has Variants</span>
                            </label>
                        </div>

                        {data.has_variants && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-700">Configured Variant Options</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const count = (data.variants || []).length + 1;
                                            const newVariant = {
                                                title: `Option ${count}`,
                                                sku: `${data.sku || 'SKU'}-${count}`,
                                                price: data.base_price || '',
                                                stock: 10,
                                            };
                                            setData('variants', [...(data.variants || []), newVariant]);
                                        }}
                                        className="text-xs font-bold text-brand-primary hover:text-brand-secondary"
                                    >
                                        + Add Variant Option
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {(data.variants || []).map((v, vIdx) => (
                                        <div key={vIdx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                                            <div className="col-span-4">
                                                <label className="text-[10px] text-slate-500 font-medium block">Title (e.g. Size M / Black)</label>
                                                <input
                                                    type="text"
                                                    value={v.title}
                                                    onChange={(e) => {
                                                        const next = [...data.variants];
                                                        next[vIdx].title = e.target.value;
                                                        setData('variants', next);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-brand-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="text-[10px] text-slate-500 font-medium block">SKU</label>
                                                <input
                                                    type="text"
                                                    value={v.sku}
                                                    onChange={(e) => {
                                                        const next = [...data.variants];
                                                        next[vIdx].sku = e.target.value.toUpperCase();
                                                        setData('variants', next);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs uppercase font-mono border border-slate-300 rounded focus:ring-1 focus:ring-brand-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] text-slate-500 font-medium block">Price (â‚¹)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={v.price}
                                                    onChange={(e) => {
                                                        const next = [...data.variants];
                                                        next[vIdx].price = e.target.value;
                                                        setData('variants', next);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-brand-primary"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] text-slate-500 font-medium block">Stock</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={v.stock}
                                                    onChange={(e) => {
                                                        const next = [...data.variants];
                                                        next[vIdx].stock = e.target.value;
                                                        setData('variants', next);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-brand-primary"
                                                />
                                            </div>
                                            <div className="col-span-1 text-right pt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = data.variants.filter((_, i) => i !== vIdx);
                                                        setData('variants', next);
                                                    }}
                                                    className="text-rose-500 hover:text-rose-700 font-bold text-sm"
                                                    title="Remove Variant"
                                                >
                                                    Ã—
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Return, Exchange & Cash on Delivery (COD) Policies */}
                    <div className="pt-5 mt-4 border-t border-slate-100 space-y-4">
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Return / Exchange & Payment Policies
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Return / Exchange Toggle */}
                            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.has_return_exchange}
                                        onChange={(e) => setData('has_return_exchange', e.target.checked)}
                                        className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800 block">
                                            Allow Return / Exchange
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Customers can request returns/exchanges for this item
                                        </span>
                                    </div>
                                </label>

                                {data.has_return_exchange && (
                                    <div className="pt-2 pl-7 border-t border-slate-200/60">
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Return / Exchange Window
                                        </label>
                                        <select
                                            value={data.return_window_days}
                                            onChange={(e) => setData('return_window_days', parseInt(e.target.value, 10))}
                                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                        >
                                            <option value={3}>3 Days Return & Exchange (Recommended)</option>
                                            <option value={7}>7 Days Return & Exchange</option>
                                            <option value={10}>10 Days Return & Exchange</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Cash on Delivery (COD) Toggle */}
                            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.cod_available}
                                        onChange={(e) => setData('cod_available', e.target.checked)}
                                        className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800 block">
                                            Cash on Delivery (COD) Available
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {data.cod_available ? 'Customers can pay via cash upon delivery' : 'Prepaid orders only (No COD)'}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Uploads Card - Client-side Auto 1:1 Square + Sub-100KB Optimization */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-brand-primary" />
                            <h2 className="text-base font-semibold text-slate-900">
                                Product Images (Manual Upload)
                            </h2>
                        </div>
                        <span className="text-xs bg-brand-surface-accent text-brand-secondary font-semibold px-2.5 py-1 rounded-full border border-brand-border">
                            Auto 1:1 Square &bull; Client Optimized &lt;100KB WebP
                        </span>
                    </div>

                    {/* Drag-and-drop & File Selection Box */}
                    <div className="space-y-4">
                        <div className={`border-2 border-dashed ${isOptimizing ? 'border-brand-primary/60 bg-brand-surface-accent/40' : 'border-slate-300 hover:border-brand-primary bg-slate-50/60 hover:bg-brand-surface-accent/30'} rounded-xl p-6 text-center transition-all cursor-pointer relative`}>
                            <input
                                type="file"
                                id="manual-image-input"
                                multiple
                                disabled={isOptimizing}
                                accept="image/png,image/jpeg,image/webp,image/jpg"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                            />
                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-brand-surface-muted text-brand-primary flex items-center justify-center mb-2">
                                    {isOptimizing ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Upload className="w-6 h-6" />
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {isOptimizing ? 'Optimizing images to 1:1 square (<100KB)...' : 'Click here or drag images to upload'}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Upload 1 or more images. 1 image = static photo. 2+ images = auto-sliding carousel!
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-600 font-semibold">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Browser auto-crops to 1:1 square & compresses under 100KB to guarantee instant saving</span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Images Preview List (1:1 Ratio Thumbnails) */}
                        {previewUrls.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Selected Images ({previewUrls.length}):
                                    </p>
                                    <span className="text-xs text-slate-500">
                                        First image is the primary cover image
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {previewUrls.map((prev, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs"
                                        >
                                            <img
                                                src={prev.url}
                                                alt={`Preview ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {idx === 0 && (
                                                <span className="absolute top-1 left-1 bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                                    Cover
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-xs transition-colors"
                                                title="Remove this image"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="absolute inset-x-0 bottom-0 bg-slate-900/70 p-1 text-center">
                                                <p className="text-[10px] text-white truncate font-medium">{prev.name}</p>
                                                <p className="text-[9px] text-slate-300">{prev.size}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Optional Primary Image URL for External Links */}
                        <div className="pt-3 border-t border-slate-100">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Or enter external Image URL (Optional fallback)
                            </label>
                            <input
                                type="url"
                                value={data.primary_image_url}
                                onChange={(e) => setData('primary_image_url', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
                            />
                            {errors.primary_image_url && (
                                <p className="text-xs text-rose-500 mt-1">{errors.primary_image_url}</p>
                            )}
                        </div>

                        {/* Published & Featured Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
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
                                    className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
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
                        disabled={processing || isOptimizing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : isOptimizing ? 'Optimizing Photos...' : 'Save & Publish Product'}</span>
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
