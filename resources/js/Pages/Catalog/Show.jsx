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
    Star,
    Camera,
    Image as ImageIcon,
    Upload,
    X,
} from 'lucide-react';
import { addToCart, MAX_CART_LIMIT } from '../../utils/cart';
import { optimizeImageToSquareWebP } from '../../utils/imageOptimizer';

export default function Show({ product, relatedProducts = [], categories = [] }) {
    const { auth, storeSettings } = usePage().props;
    const user = auth?.user;
    const currency = storeSettings?.currency_symbol || '₹';

    const [reviews, setReviews] = useState(product.reviews || []);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(null);
    const [reviewError, setReviewError] = useState(null);

    // Review form state
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [authorName, setAuthorName] = useState(user?.name || '');
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewPhotos, setReviewPhotos] = useState([]);
    const [photoOptimizing, setPhotoOptimizing] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState(null);

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

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
        : '5.0';

    const allPhotos = reviews.flatMap((r) => {
        let photos = r.photos;
        if (typeof photos === 'string') {
            try { photos = JSON.parse(photos); } catch (e) { photos = []; }
        }
        return Array.isArray(photos) ? photos : [];
    }).filter(Boolean);

    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setPhotoOptimizing(true);
        try {
            const optimized = [];
            for (const file of files) {
                if (reviewPhotos.length + optimized.length >= 3) break;
                const result = await optimizeImageToSquareWebP(file, 600);
                optimized.push(result.dataUrl);
            }
            setReviewPhotos((prev) => [...prev, ...optimized].slice(0, 3));
        } catch (err) {
            console.error('Photo optimization error:', err);
        } finally {
            setPhotoOptimizing(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError(null);
        setReviewSubmitting(true);

        const payload = {
            author_name: authorName.trim(),
            rating,
            title: reviewTitle.trim() || undefined,
            comment: reviewComment.trim(),
            photos: reviewPhotos,
        };

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/products/${product.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setReviewSuccess(data.message || 'Thank you! Your review has been added.');
                if (data.review) {
                    setReviews((prev) => [data.review, ...prev]);
                }
                setTimeout(() => {
                    setReviewModalOpen(false);
                    setReviewSuccess(null);
                    setReviewTitle('');
                    setReviewComment('');
                    setReviewPhotos([]);
                }, 1800);
            } else {
                setReviewError(data.message || 'Could not submit review.');
            }
        } catch (err) {
            setReviewError('Failed to submit review. Please try again.');
        } finally {
            setReviewSubmitting(false);
        }
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
                                <div className="flex items-center gap-2 pt-2 text-xs">
                                    <Truck className="w-4 h-4 text-brand-primary shrink-0" />
                                    {product.delivery_fee && parseFloat(product.delivery_fee) > 0 ? (
                                        <span className="text-brand-text font-medium">
                                            Delivery: <strong className="font-bold text-brand-secondary">{formatPrice(product.delivery_fee)}</strong>
                                        </span>
                                    ) : (
                                        <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                                            FREE Delivery
                                        </span>
                                    )}
                                </div>
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

                        {/* Confidence Guarantees: Delivery, COD, Returns & Warranty */}
                        <div className="pt-6 border-t border-brand-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px] text-brand-text-muted">
                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-brand-surface-muted border border-brand-border/60">
                                <Truck className="w-4 h-4 text-brand-primary" />
                                <span className="font-semibold text-brand-secondary">
                                    {product.delivery_fee > 0 ? `₹${parseFloat(product.delivery_fee)} Delivery` : 'Free Delivery'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-brand-surface-muted border border-brand-border/60">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold text-brand-secondary">
                                    {product.cod_available ? 'COD Available' : 'Prepaid Only'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-brand-surface-muted border border-brand-border/60">
                                <RefreshCw className="w-4 h-4 text-brand-primary" />
                                <span className="font-semibold text-brand-secondary">
                                    {product.has_return_exchange ? `${product.return_window_days || 7} Days Return` : 'Non-Returnable'}
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-brand-surface-muted border border-brand-border/60">
                                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                                <span className="font-semibold text-brand-secondary">100% Genuine</span>
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

                {/* Customer Ratings & Photo Reviews Section */}
                <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                    Customer Ratings & Reviews
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>{avgRating} / 5</span>
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Real customer feedback with photo verifications and 5-star ratings.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setReviewModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
                        >
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span>Rate & Review Product</span>
                        </button>
                    </div>

                    {/* Customer Photos Gallery (if any photos uploaded) */}
                    {allPhotos.length > 0 && (
                        <div className="py-6 border-b border-slate-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-indigo-600" />
                                <span>Customer Photos ({allPhotos.length})</span>
                            </h3>
                            <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                {allPhotos.map((photoUrl, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setPreviewPhoto(photoUrl)}
                                        className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-xs"
                                    >
                                        <img
                                            src={photoUrl}
                                            alt={`Customer review photo ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Listing */}
                    <div className="divide-y divide-slate-100 mt-4">
                        {reviews.length > 0 ? (
                            reviews.map((rev) => {
                                let revPhotos = rev.photos;
                                if (typeof revPhotos === 'string') {
                                    try { revPhotos = JSON.parse(revPhotos); } catch (e) { revPhotos = []; }
                                }
                                const photoList = Array.isArray(revPhotos) ? revPhotos : [];

                                return (
                                    <div key={rev.id || Math.random()} className="py-5 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3.5 h-3.5 ${
                                                                star <= (rev.rating || 5)
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-slate-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                {rev.title && (
                                                    <span className="font-bold text-xs text-slate-900">{rev.title}</span>
                                                )}
                                            </div>

                                            <span className="text-[11px] text-slate-400">
                                                {rev.created_at
                                                    ? new Date(rev.created_at).toLocaleDateString('en-IN', {
                                                          day: '2-digit',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : 'Recently'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                            {rev.comment}
                                        </p>

                                        {/* Review Photos */}
                                        {photoList.length > 0 && (
                                            <div className="flex items-center gap-2 pt-1">
                                                {photoList.map((pUrl, pIdx) => (
                                                    <div
                                                        key={pIdx}
                                                        onClick={() => setPreviewPhoto(pUrl)}
                                                        className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                    >
                                                        <img
                                                            src={pUrl}
                                                            alt="Customer review uploaded image"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                                            <span className="font-semibold text-slate-800">{rev.author_name}</span>
                                            {rev.is_verified_purchase && (
                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Verified Purchase</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-slate-500">
                                <Star className="w-10 h-10 text-amber-300 fill-amber-100 mx-auto mb-2" />
                                <h4 className="font-bold text-slate-900 text-sm">No Customer Reviews Yet</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                                    Have you purchased this product? Be the first customer to share your photo and 5-star experience!
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setReviewModalOpen(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                                >
                                    Write the First Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Submission Modal */}
                {reviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[92vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Write a Customer Review</h3>
                                    <p className="text-xs text-slate-500">{product.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReviewModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {reviewSuccess ? (
                                <div className="py-8 text-center text-emerald-700">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                                    <p className="font-bold text-base">Review Published!</p>
                                    <p className="text-xs text-slate-600 mt-1">{reviewSuccess}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                                    {reviewError && (
                                        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{reviewError}</span>
                                        </div>
                                    )}

                                    {/* Star Rating Picker */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Overall Rating *
                                        </label>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="p-1 text-slate-300 hover:scale-110 transition-transform"
                                                >
                                                    <Star
                                                        className={`w-7 h-7 ${
                                                            star <= (hoverRating || rating)
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-slate-300'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-xs font-bold text-slate-700 ml-2">
                                                {hoverRating || rating} out of 5 Stars
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            required
                                            placeholder="Display name on review"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Headline / Review Title (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={reviewTitle}
                                            onChange={(e) => setReviewTitle(e.target.value)}
                                            placeholder="E.g., Great quality, fits perfectly!"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Written Feedback *
                                        </label>
                                        <textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            required
                                            rows={3}
                                            placeholder="Write your honest opinion about the product quality, fit, material..."
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Photo Upload (1:1 Optimized <100KB) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Add Customer Photos (Optional &bull; Max 3)
                                        </label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {reviewPhotos.map((photo, pIdx) => (
                                                <div key={pIdx} className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden">
                                                    <img src={photo} alt="Upload preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setReviewPhotos((prev) => prev.filter((_, i) => i !== pIdx))}
                                                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {reviewPhotos.length < 3 && (
                                                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors">
                                                    <Camera className="w-5 h-5 mb-0.5" />
                                                    <span className="text-[9px] font-semibold">Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handlePhotoUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {photoOptimizing && (
                                            <p className="text-[11px] text-indigo-600 mt-1">Optimizing photos to 1:1 format...</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setReviewModalOpen(false)}
                                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={reviewSubmitting || photoOptimizing}
                                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Lightbox Photo Preview Modal */}
                {previewPhoto && (
                    <div
                        onClick={() => setPreviewPhoto(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
                    >
                        <div className="relative max-w-lg max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                onClick={() => setPreviewPhoto(null)}
                                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-1.5 rounded-full z-10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <img src={previewPhoto} alt="Customer preview enlarged" className="w-full h-auto max-h-[75vh] object-contain rounded-xl" />
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
