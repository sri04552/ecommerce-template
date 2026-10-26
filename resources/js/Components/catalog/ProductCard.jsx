import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Badge from '../ui/Badge';
import { ShoppingBag, Sparkles, Heart } from 'lucide-react';
import { isProductInWishlist, toggleWishlistItem } from '@/utils/wishlist';

export default function ProductCard({ product }) {
    const { auth, storeSettings } = usePage().props;
    const currency = storeSettings?.currency_symbol || '₹';
    const [inWishlist, setInWishlist] = useState(() => isProductInWishlist(product.id));
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        setInWishlist(isProductInWishlist(product.id));

        const handleWishlistSync = () => {
            setInWishlist(isProductInWishlist(product.id));
        };

        window.addEventListener('aura-wishlist-updated', handleWishlistSync);
        return () => window.removeEventListener('aura-wishlist-updated', handleWishlistSync);
    }, [product.id]);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setWishlistLoading(true);
        try {
            const res = await toggleWishlistItem(product, auth?.user);
            setInWishlist(res.inWishlist);
        } catch (err) {
            console.error('Failed to update wishlist:', err);
        } finally {
            setWishlistLoading(false);
        }
    };

    const primaryImage = product.primary_image?.image_path || product.images?.[0]?.image_path;
    const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.base_price);
    const displayPrice = hasDiscount ? product.sale_price : product.base_price;
    const originalPrice = product.base_price;

    const discountPercent = product.discount_percentage
        ? Math.round(product.discount_percentage)
        : (hasDiscount && originalPrice > 0
            ? Math.round(((parseFloat(originalPrice) - parseFloat(displayPrice)) / parseFloat(originalPrice)) * 100)
            : null);

    const formatPrice = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        return `${currency}${num.toLocaleString('en-IN', {
            minimumFractionDigits: num % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <div className="group relative bg-brand-surface border border-brand-border rounded-brand overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            {/* Product Image Area */}
            <div className="relative aspect-square bg-brand-surface-muted overflow-hidden flex items-center justify-center">
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-brand-text-muted p-4 text-center">
                        <ShoppingBag className="w-10 h-10 opacity-30 mb-2" />
                        <span className="text-[11px] font-medium uppercase tracking-wider opacity-60">No Image</span>
                    </div>
                )}

                {/* Floating Badges (Offers, Discounts, Featured) */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                    {product.offer_tag && (
                        <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs tracking-wide">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{product.offer_tag}</span>
                        </span>
                    )}
                    {hasDiscount && (
                        <Badge variant="danger" className="text-[10px] font-bold shadow-xs">
                            {discountPercent ? `${discountPercent}% OFF` : 'SALE'}
                        </Badge>
                    )}
                    {product.is_featured && (
                        <Badge variant="primary" className="text-[10px] shadow-xs">
                            Featured
                        </Badge>
                    )}
                </div>

                {/* Floating Wishlist Heart Button */}
                <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs transition-colors"
                    title={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'text-rose-500 fill-rose-500' : ''}`} />
                </button>
            </div>

            {/* Product Content Details */}
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                    {product.category && (
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-brand-primary mb-1 truncate">
                            {product.category.name}
                        </p>
                    )}

                    <h3 className="font-semibold text-xs sm:text-sm text-brand-secondary line-clamp-2 group-hover:text-brand-primary transition-colors leading-snug">
                        <Link href={`/products/${product.slug}`}>
                            <span aria-hidden="true" className="absolute inset-0 z-0"></span>
                            {product.name}
                        </Link>
                    </h3>

                    {product.short_description && (
                        <p className="mt-1 text-[11px] sm:text-xs text-brand-text-muted line-clamp-2 leading-relaxed hidden sm:block">
                            {product.short_description}
                        </p>
                    )}

                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 text-[9px] sm:text-[10px]">
                        {product.delivery_fee && parseFloat(product.delivery_fee) > 0 ? (
                            <span className="text-slate-500 font-medium truncate">
                                +{formatPrice(product.delivery_fee)} Delivery
                            </span>
                        ) : (
                            <span className="text-emerald-600 font-semibold truncate">
                                Free Delivery
                            </span>
                        )}
                        <span className="text-slate-400 font-medium truncate">
                            {product.cod_available ? 'COD' : 'Prepaid'}
                        </span>
                    </div>
                </div>

                <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-brand-border flex items-center justify-between z-10 relative">
                    <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-brand-secondary">
                            {formatPrice(displayPrice)}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="text-[10px] sm:text-xs text-brand-text-muted line-through">
                                    {formatPrice(originalPrice)}
                                </span>
                                {discountPercent && (
                                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600">
                                        {discountPercent}%
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    <Link
                        href={`/products/${product.slug}`}
                        className="text-[11px] sm:text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors shrink-0"
                    >
                        View &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
