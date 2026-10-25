import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    Save,
    Eye,
    Image as ImageIcon,
    Plus,
    Upload,
    X,
    Tag,
    Percent,
    Sparkles,
    CheckCircle2,
    Lock,
    AlertTriangle,
    Loader2,
    Truck,
} from 'lucide-react';
import { optimizeImageToSquareWebP } from '../../../utils/imageOptimizer';

export default function ProductEdit({ product, categories, brands, hasOrders = false }) {
    const existingImages = product.images || [];

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Determine initial offer type
    const initialOfferTag = product.offer_tag || '';
    const presetOffers = ['Deal of the Day', 'Limited Time Deal', 'Festive Offer', 'Clearance Sale', 'Special Offer'];
    const isPreset = presetOffers.includes(initialOfferTag);
    const [offerType, setOfferType] = useState(!initialOfferTag ? 'none' : (isPreset ? initialOfferTag : 'custom'));
    const [customOffer, setCustomOffer] = useState(!isPreset ? initialOfferTag : '');

    const { data, setData, processing, errors } = useForm({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        base_price: product.base_price || '',
        sale_price: product.sale_price || '',
        delivery_fee: product.delivery_fee !== null && product.delivery_fee !== undefined ? product.delivery_fee : '',
        discount_percentage: product.discount_percentage || '',
        offer_tag: initialOfferTag,
        cost_price: product.cost_price || '',
        is_active: Boolean(product.is_active),
        is_featured: Boolean(product.is_featured),
        short_description: product.short_description || '',
        description: product.description || '',
        primary_image_url: product.images?.[0]?.image_path || '',
        images: [],
    });

    const handleFileChange = async (e) => {
        if (hasOrders) return;
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
        if (hasOrders) return;
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
        if (hasOrders) return;
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
        if (hasOrders || isOptimizing) return;

        // Use Inertia router.post with _method: 'put' and forceFormData for proper file uploading in PHP/Laravel
        router.post(
            `/admin/products/${product.id}`,
            {
                _method: 'put',
                ...data,
                images: selectedFiles,
            },
            {
                forceFormData: true,
            }
        );
    };

    const baseNum = parseFloat(data.base_price) || 0;
    const saleNum = parseFloat(data.sale_price) || 0;
    const customerSavings = baseNum > 0 && saleNum > 0 && saleNum < baseNum ? (baseNum - saleNum).toFixed(2) : 0;

    return (
        <AdminLayout
            title={`Edit Product: ${product.name}`}
            subtitle={hasOrders ? 'Product is locked from modification because orders exist.' : 'Update product pricing, images, discounts, and attributes.'}
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
            {/* Anti-Tampering Protection Banner */}
            {hasOrders && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm flex items-start gap-3.5">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-amber-900 flex items-center gap-2">
                            <span>Editing Locked &bull; Anti-Fraud & Transaction Integrity Protection</span>
                        </h3>
                        <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                            Customers have already placed orders for this product. To protect transaction records, comply with consumer laws, and prevent price manipulation or disputes on ordered items, this product cannot be edited.
                        </p>
                        <p className="text-xs text-amber-700 font-medium mt-2">
                            To sell new variants or at different prices, create a new product catalog entry instead.
                        </p>
                    </div>
                </div>
            )}

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
                                disabled={hasOrders}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
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
                                    disabled={hasOrders}
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
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
                                    disabled={hasOrders}
                                    value={data.sku}
                                    onChange={(e) => setData('sku', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white uppercase font-mono disabled:opacity-60 disabled:bg-slate-100"
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
                                    disabled={hasOrders}
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
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
                                    disabled={hasOrders}
                                    value={data.brand_id}
                                    onChange={(e) => setData('brand_id', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
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
                                disabled={hasOrders}
                                value={data.short_description}
                                onChange={(e) => setData('short_description', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
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
                                disabled={hasOrders}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
                            />
                            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Pricing, Discounts, Delivery & Deals Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-indigo-600" />
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
                                Base / MRP (₹) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                disabled={hasOrders}
                                value={data.base_price}
                                onChange={(e) => handleBasePriceChange(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium disabled:opacity-60 disabled:bg-slate-100"
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
                                    disabled={hasOrders}
                                    value={data.discount_percentage}
                                    onChange={(e) => handleDiscountChange(e.target.value)}
                                    placeholder="e.g. 25"
                                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium disabled:opacity-60 disabled:bg-slate-100"
                                />
                            </div>
                            {errors.discount_percentage && <p className="text-xs text-rose-500 mt-1">{errors.discount_percentage}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Final Sale Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                disabled={hasOrders}
                                value={data.sale_price}
                                onChange={(e) => handleSalePriceChange(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold text-emerald-700 disabled:opacity-60 disabled:bg-slate-100"
                            />
                            {errors.sale_price && <p className="text-xs text-rose-500 mt-1">{errors.sale_price}</p>}
                        </div>
                    </div>

                    {/* Quick Discount Presets & Savings */}
                    {!hasOrders && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-medium text-slate-600 mr-1">Quick Discount:</span>
                                {[10, 20, 30, 40, 50, 70].map((pct) => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => applyQuickDiscount(pct)}
                                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
                                    >
                                        {pct}% OFF
                                    </button>
                                ))}
                            </div>

                            {customerSavings > 0 && (
                                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Customer saves ₹{customerSavings} ({data.discount_percentage}% OFF)</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delivery Fee & Special Offer Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 mb-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-indigo-600" />
                                    <span>Delivery Fee (₹)</span>
                                </label>
                                <span className="text-[11px] text-emerald-600 font-semibold">0 = Free Delivery</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                disabled={hasOrders}
                                value={data.delivery_fee}
                                onChange={(e) => setData('delivery_fee', e.target.value)}
                                placeholder="0.00 (Free Delivery)"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Enter 0 or leave empty for Free Delivery.
                            </p>
                            {errors.delivery_fee && <p className="text-xs text-rose-500 mt-1">{errors.delivery_fee}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Special Offer Badge / Deal Tag
                            </label>
                            <select
                                disabled={hasOrders}
                                value={offerType}
                                onChange={(e) => handleOfferPresetChange(e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
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
                                        disabled={hasOrders}
                                        value={customOffer}
                                        onChange={(e) => handleCustomOfferChange(e.target.value)}
                                        placeholder="e.g. Diwali Super Saver, Flat ₹500 Off"
                                        maxLength={40}
                                        className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium disabled:opacity-60 disabled:bg-slate-100"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Cost Price (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                disabled={hasOrders}
                                value={data.cost_price}
                                onChange={(e) => setData('cost_price', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:bg-slate-100"
                            />
                            {errors.cost_price && <p className="text-xs text-rose-500 mt-1">{errors.cost_price}</p>}
                        </div>
                    </div>
                </div>

                {/* Media Management - Existing Images + Upload New */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-base font-semibold text-slate-900">
                                Product Images
                            </h2>
                        </div>
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                            Strict 1:1 Aspect Ratio &bull; Client Optimized &lt;100KB WebP
                        </span>
                    </div>

                    {/* Existing Images Display */}
                    {existingImages.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Current Catalog Images ({existingImages.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {existingImages.map((img, idx) => (
                                    <div
                                        key={img.id || idx}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs"
                                    >
                                        <img
                                            src={img.image_path}
                                            alt={img.alt_text || product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                            {img.is_primary ? 'Cover' : `#${idx + 1}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!hasOrders && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Add Additional Images
                            </label>
                            <div className={`border-2 border-dashed ${isOptimizing ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/20'} rounded-xl p-5 text-center transition-all cursor-pointer relative`}>
                                <input
                                    type="file"
                                    multiple
                                    disabled={isOptimizing}
                                    accept="image/png,image/jpeg,image/webp,image/jpg"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1.5">
                                        {isOptimizing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Upload className="w-5 h-5" />
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {isOptimizing ? 'Optimizing photos to 1:1 square (<100KB)...' : 'Click to upload more product photos'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Browser auto-crops to 1:1 square & compresses under 100KB to guarantee instant saving
                                    </p>
                                </div>
                            </div>

                            {/* New Upload Previews */}
                            {previewUrls.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        New Images to Upload ({previewUrls.length}):
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {previewUrls.map((prev, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs"
                                            >
                                                <img
                                                    src={prev.url}
                                                    alt={`New Preview ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-xs transition-colors"
                                                    title="Remove"
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
                        </div>
                    )}

                    {/* Visibility Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 mt-4 border-t border-slate-100">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 ${hasOrders ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                disabled={hasOrders}
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <div>
                                <span className="text-sm font-medium text-slate-800 block">Published / Active</span>
                                <span className="text-xs text-slate-500">Visible to customers in the catalog</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 ${hasOrders ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                disabled={hasOrders}
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

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        {hasOrders ? 'Return to Products' : 'Cancel'}
                    </Link>
                    {hasOrders ? (
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 text-slate-500 font-medium text-sm rounded-lg cursor-not-allowed border border-slate-300">
                            <Lock className="w-4 h-4 text-slate-500" />
                            <span>Product Locked (Orders Placed)</span>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={processing || isOptimizing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Processing & Saving...' : isOptimizing ? 'Optimizing Photos...' : 'Save Product Changes'}</span>
                        </button>
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
