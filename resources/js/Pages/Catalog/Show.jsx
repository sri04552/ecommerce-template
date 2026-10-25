import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/catalog/ProductCard';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import {
    ShoppingBag,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Truck,
    ShieldCheck,
    RefreshCw,
    AlertTriangle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Tag,
} from 'lucide-react';
import { addToCart, MAX_CART_LIMIT } from '../../utils/cart';

export default function Show({ product, relatedProducts = [], categories = [] }) {
    const { storeSettings } = usePage().props;
    const currency = storeSettings?.currency_symbol || '₹';

    const rawImages = product.images || [];
    // Ensure primary image is first if designated
    const images = [...rawImages].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-sliding carousel when there are multiple images (> 1)
    useEffect(() => {
        if (images.length <= 1 || isHovered) return;

        const timer = setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [images.length, isHovered]);

    const handlePrevImage = () => {
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
    };

    const currentImagePath = images.length > 0
        ? images[activeImageIndex]?.image_path
        : product.primary_image?.image_path;

    const variants = product.variants || [];
    const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [cartNotification, setCartNotification] = useState(null);

    // Calculate active price based on variant override or product base price
    const activePrice = selectedVariant?.price || product.base_price;
    const activeSalePrice = selectedVariant?.sale_price || product.sale_price;
    const hasDiscount = activeSalePrice && parseFloat(activeSalePrice) < parseFloat(activePrice);
    const displayPrice = hasDiscount ? activeSalePrice : activePrice;

    const discountPercentage = product.discount_percentage
        ? Math.round(product.discount_percentage)
        : (hasDiscount && activePrice > 0
            ? Math.round(((parseFloat(activePrice) - parseFloat(activeSalePrice)) / parseFloat(activePrice)) * 100)
            : null);

    // Inventory status for selected variant
    const inventoryLevel = selectedVariant?.inventory_level;
    const quantityOnHand = inventoryLevel?.quantity_on_hand ?? 0;
    const allowBackorder = inventoryLevel?.allow_backorder ?? false;
    const inStock = quantityOnHand > 0 || allowBackorder;

    const handleAddToCart = () => {
        const res = addToCart(product, selectedVariant, quantity);
        setCartNotification(res);
        if (res.success) {
            setTimeout(() => {
                setCartNotification((prev) => (prev === res ? null : prev));
            }, 6000);
        }
    };

    const formatPrice = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        return `${currency}${num.toLocaleString('en-IN', {
            minimumFractionDigits: num % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <StorefrontLayout categories={categories}>
            <Head title={`${product.name} — Store Catalog`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Breadcrumbs */}
                <div className="text-xs text-brand-text-muted mb-6 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-brand-text">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-brand-text">Catalog</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-text">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="font-semibold text-brand-secondary truncate max-w-xs">{product.name}</span>
                </div>

                {/* Product Main Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-brand-surface border border-brand-border rounded-brand p-6 sm:p-8">
                    {/* Column 1: Image Gallery & Carousel */}
                    <div className="space-y-4">
                        {/* 1:1 Aspect Ratio Image Frame */}
                        <div
                            className="group relative aspect-square bg-brand-surface-muted rounded-brand overflow-hidden border border-brand-border flex items-center justify-center select-none"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {currentImagePath ? (
                                <img
                                    src={currentImagePath}
                                    alt={product.name}
                                    className="w-full h-full object-cover object-center transition-opacity duration-300"
                                />
                            ) : (
                                <div className="text-center p-8 text-brand-text-muted">
                                    <ShoppingBag className="w-16 h-16 opacity-30 mx-auto mb-2" />
                                    <span className="text-xs uppercase font-medium tracking-wider">No Image Available</span>
                                </div>
                            )}

                            {/* Floating Deal & Discount Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                                {product.offer_tag && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md tracking-wide uppercase">
                                        <Sparkles className="w-3 h-3" />
                                        <span>{product.offer_tag}</span>
                                    </span>
                                )}
                                {discountPercentage && discountPercentage > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs tracking-wide">
                                        <span>{discountPercentage}% OFF</span>
                                    </span>
                                )}
                            </div>

                            {/* Carousel Navigation Arrows - ONLY rendered when images.length > 1 */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        aria-label="Previous image"
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 z-10"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        aria-label="Next image"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 z-10"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {/* Slide Counter Indicator */}
                                    <div className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-full pointer-events-none z-10">
                                        {activeImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnails Strip - ONLY rendered when images.length > 1 */}
                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={img.id || idx}
                                        type="button"
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`w-16 h-16 rounded-brand overflow-hidden border-2 shrink-0 transition-all aspect-square ${
                                            activeImageIndex === idx
                                                ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-105'
                                                : 'border-brand-border opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img.image_path} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Column 2: Product Information & Purchase Controls */}
                    <div className="space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            {/* Brand & Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {product.brand && (
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                                        {product.brand.name}
                                    </span>
                                )}
                                {product.is_featured && (
                                    <Badge variant="primary" className="text-[10px]">
                                        Featured Item
                                    </Badge>
                                )}
                                {product.offer_tag && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        <Tag className="w-3 h-3 text-amber-600" />
                                        <span>{product.offer_tag}</span>
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-secondary tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 text-xs text-brand-text-muted">
                                <span>SKU: <strong className="text-brand-text font-mono">{selectedVariant?.sku || product.sku}</strong></span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    {inStock ? (
                                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({quantityOnHand} units)
                                        </span>
                                    ) : (
                                        <span className="text-rose-600 font-medium flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Price Block with Flipkart/Amazon Style Savings */}
                            <div className="pt-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-extrabold text-brand-secondary">
                                        {formatPrice(displayPrice)}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="text-base text-brand-text-muted line-through">
                                                {formatPrice(activePrice)}
                                            </span>
                                            {discountPercentage && (
                                                <span className="text-sm font-bold text-emerald-600">
                                                    {discountPercentage}% off
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                {hasDiscount && (
                                    <p className="text-xs text-emerald-700 font-semibold mt-1">
                                        You save {formatPrice(parseFloat(activePrice) - parseFloat(activeSalePrice))} on this order
                                    </p>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.short_description && (
                                <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed pt-2">
                                    {product.short_description}
                                </p>
                            )}

                            {/* Variant Selector (if variants exist) */}
                            {variants.length > 1 && (
                                <div className="pt-4 border-t border-brand-border space-y-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                                        Select Option: <span className="text-brand-primary">{selectedVariant?.title}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {variants.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => setSelectedVariant(v)}
                                                className={`px-3.5 py-2 text-xs font-medium rounded-brand border transition-all ${
                                                    selectedVariant?.id === v.id
                                                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary'
                                                        : 'border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surface-muted'
                                                }`}
                                            >
                                                {v.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Add to Cart Controls */}
                            <div className="pt-4 border-t border-brand-border space-y-3">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-brand-border rounded-brand bg-brand-surface">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 text-xs text-brand-text hover:bg-brand-surface-muted"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-2 text-xs font-semibold min-w-8 text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2 text-xs text-brand-text hover:bg-brand-surface-muted"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="md"
                                        disabled={!inStock}
                                        onClick={handleAddToCart}
                                        className="flex-1 gap-2 py-2.5 font-semibold"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>{inStock ? 'Add to Cart' : 'Sold Out'}</span>
                                    </Button>
                                </div>

                                {/* Dynamic Cart Feedback & 20-Product Limit Alert */}
                                {cartNotification && (
                                    <div
                                        role="alert"
                                        className={`p-3.5 rounded-lg border text-xs transition-all animate-fadeIn ${
                                            cartNotification.success
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                : 'bg-rose-50 border-rose-300 text-rose-950 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            {cartNotification.success ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="font-bold">
                                                        {cartNotification.success
                                                            ? 'Added Successfully'
                                                            : 'Cart Limit Notice (Max 20 Items)'}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                            cartNotification.success
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-200 text-rose-900'
                                                        }`}
                                                    >
                                                        {cartNotification.totalItems}/{MAX_CART_LIMIT} Items
                                                    </span>
                                                </div>
                                                <p className="leading-relaxed">
                                                    {cartNotification.message}
                                                </p>
                                                <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between gap-3">
                                                    <Link
                                                        href="/cart"
                                                        className={`inline-flex items-center gap-1 font-bold underline hover:no-underline ${
                                                            cartNotification.success
                                                                ? 'text-emerald-800'
                                                                : 'text-rose-900'
                                                        }`}
                                                    >
                                                        <span>View Shopping Cart</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCartNotification(null)}
                                                        className="text-[11px] opacity-70 hover:opacity-100 font-medium"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Confidence Guarantees */}
                        <div className="pt-6 border-t border-brand-border grid grid-cols-3 gap-3 text-center text-[11px] text-brand-text-muted">
                            <div className="flex flex-col items-center gap-1">
                                <Truck className="w-4 h-4 text-brand-primary" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                                <span>Direct Warranty</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <RefreshCw className="w-4 h-4 text-brand-primary" />
                                <span>30-Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Description Section */}
                {product.description && (
                    <div className="mt-12 bg-brand-surface border border-brand-border rounded-brand p-8">
                        <h2 className="text-lg font-bold text-brand-secondary mb-4">
                            Product Description
                        </h2>
                        <div className="text-xs sm:text-sm text-brand-text leading-relaxed whitespace-pre-line">
                            {product.description}
                        </div>
                    </div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold tracking-tight text-brand-secondary">
                                Related Products
                            </h2>
                            <Link href="/products" className="text-xs font-semibold text-brand-primary hover:underline">
                                View Catalog &rarr;
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
