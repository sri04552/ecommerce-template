import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Button from '../../Components/ui/Button';
import {
    ShoppingBag,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    Trash2,
    Plus,
    Minus,
    AlertTriangle,
    Truck,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';
import {
    getCart,
    getCartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    onCartChange,
    MAX_CART_LIMIT,
} from '../../utils/cart';

export default function CartIndex({ categories = [] }) {
    const { storeSettings } = usePage().props;
    const currency = storeSettings?.currency_symbol || '₹';

    const [cart, setCart] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [alertMessage, setAlertMessage] = useState(null);

    const refreshCart = () => {
        const items = getCart();
        setCart(items);
        setTotalCount(getCartCount());
    };

    useEffect(() => {
        refreshCart();
        const unsubscribe = onCartChange(() => {
            refreshCart();
        });
        return unsubscribe;
    }, []);

    const formatPrice = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return amount;
        return `${currency}${num.toLocaleString('en-IN', {
            minimumFractionDigits: num % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleIncrement = (item) => {
        if (totalCount >= MAX_CART_LIMIT) {
            setAlertMessage(
                `Maximum cart limit reached! You can have at most ${MAX_CART_LIMIT} products in your cart.`
            );
            return;
        }
        const res = updateQuantity(item.id, item.quantity + 1);
        if (!res.success) {
            setAlertMessage(res.message);
        } else {
            setAlertMessage(null);
            refreshCart();
        }
    };

    const handleDecrement = (item) => {
        setAlertMessage(null);
        if (item.quantity <= 1) {
            removeFromCart(item.id);
        } else {
            updateQuantity(item.id, item.quantity - 1);
        }
        refreshCart();
    };

    const handleRemove = (itemId) => {
        removeFromCart(itemId);
        setAlertMessage(null);
        refreshCart();
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all items from your cart?')) {
            clearCart();
            setAlertMessage(null);
            refreshCart();
        }
    };

    const subtotal = cart.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0),
        0
    );

    const FREE_SHIPPING_THRESHOLD = 999;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : 99) : 0;
    const finalTotal = subtotal + shippingFee;
    const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

    const limitPercentage = Math.min(100, Math.round((totalCount / MAX_CART_LIMIT) * 100));

    return (
        <StorefrontLayout categories={categories}>
            <Head title="Shopping Cart" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Breadcrumb */}
                <div className="text-xs text-brand-text-muted mb-4 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-brand-text">Home</Link>
                    <span>/</span>
                    <span className="font-semibold text-brand-secondary">Cart</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-secondary">
                            Your Shopping Cart
                        </h1>
                        <p className="text-xs text-brand-text-muted mt-1">
                            Review your items, apply delivery thresholds, and manage order quantities.
                        </p>
                    </div>

                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto hover:underline"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {/* 20-Product Limit Notification Alert (If triggered) */}
                {alertMessage && (
                    <div
                        role="alert"
                        className="mb-6 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 flex items-start gap-3 text-xs shadow-xs animate-fadeIn"
                    >
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1 flex items-center justify-between gap-3">
                            <div>
                                <span className="font-bold block mb-0.5">Cart Limit Alert</span>
                                <span>{alertMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAlertMessage(null)}
                                className="text-rose-700 hover:text-rose-900 font-bold px-2 py-1 rounded-md text-[11px] hover:bg-rose-100"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {cart.length === 0 ? (
                    /* Empty Cart State */
                    <div className="bg-brand-surface border border-brand-border rounded-brand p-12 text-center max-w-2xl mx-auto shadow-2xs">
                        <div className="w-16 h-16 rounded-full bg-brand-surface-muted flex items-center justify-center mx-auto mb-4 text-brand-text-muted">
                            <ShoppingBag className="w-8 h-8 opacity-40" />
                        </div>

                        <h2 className="text-lg font-bold text-brand-secondary mb-2">
                            Your cart is currently empty
                        </h2>

                        <p className="text-xs text-brand-text-muted max-w-sm mx-auto mb-6 leading-relaxed">
                            Discover our curated catalog of fashion, tech, and lifestyle essentials with nationwide delivery across India.
                        </p>

                        <Link href="/products">
                            <Button variant="primary" size="md" className="gap-2">
                                <span>Browse Product Catalog</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    /* Active Cart Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cart Items Column (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* 20-Product Limit Indicator & Capacity Bar */}
                            <div className="bg-brand-surface border border-brand-border rounded-brand p-4 shadow-2xs">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-brand-secondary">Cart Capacity</span>
                                        <span className="text-[11px] text-brand-text-muted">
                                            (Maximum {MAX_CART_LIMIT} products limit)
                                        </span>
                                    </div>
                                    <span
                                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                                            totalCount >= MAX_CART_LIMIT
                                                ? 'bg-rose-100 text-rose-800'
                                                : totalCount >= 15
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                    >
                                        {totalCount} / {MAX_CART_LIMIT} items ({limitPercentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-brand-surface-muted h-2 rounded-full overflow-hidden border border-brand-border">
                                    <div
                                        className={`h-full transition-all duration-300 ${
                                            totalCount >= MAX_CART_LIMIT
                                                ? 'bg-rose-500'
                                                : totalCount >= 15
                                                ? 'bg-amber-500'
                                                : 'bg-brand-primary'
                                        }`}
                                        style={{ width: `${limitPercentage}%` }}
                                    />
                                </div>
                                {totalCount >= MAX_CART_LIMIT && (
                                    <p className="mt-2 text-[11px] text-rose-600 font-semibold flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Cart limit reached. You have reached the maximum allowed limit of 20 products.
                                    </p>
                                )}
                            </div>

                            {/* Items List */}
                            <div className="bg-brand-surface border border-brand-border rounded-brand overflow-hidden shadow-2xs divide-y divide-brand-border">
                                {cart.map((item) => {
                                    const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 0);

                                    return (
                                        <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-brand bg-brand-surface-muted border border-brand-border overflow-hidden shrink-0 flex items-center justify-center">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ShoppingBag className="w-6 h-6 text-brand-text-muted opacity-40" />
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-1">
                                                    <h3 className="font-semibold text-sm text-brand-secondary hover:text-brand-primary transition-colors">
                                                        <Link href={`/products/${item.slug}`}>
                                                            {item.name}
                                                        </Link>
                                                    </h3>
                                                    {item.variantTitle && (
                                                        <p className="text-xs text-brand-primary font-medium">
                                                            Option: {item.variantTitle}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-brand-text-muted font-mono">
                                                        SKU: {item.sku}
                                                    </p>
                                                    <p className="text-xs font-semibold text-brand-secondary sm:hidden">
                                                        {formatPrice(item.price)} each
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quantity & Item Total Controls */}
                                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border">
                                                {/* Quantity Selector */}
                                                <div className="flex items-center border border-brand-border rounded-brand bg-brand-surface">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDecrement(item)}
                                                        className="p-1.5 sm:p-2 text-brand-text hover:bg-brand-surface-muted transition-colors disabled:opacity-40"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="px-3 py-1 text-xs font-bold text-center min-w-[36px]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleIncrement(item)}
                                                        disabled={totalCount >= MAX_CART_LIMIT}
                                                        className="p-1.5 sm:p-2 text-brand-text hover:bg-brand-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Price Column */}
                                                <div className="text-right min-w-[90px]">
                                                    <span className="font-bold text-sm text-brand-secondary block">
                                                        {formatPrice(itemTotal)}
                                                    </span>
                                                    <span className="text-[11px] text-brand-text-muted hidden sm:block">
                                                        {formatPrice(item.price)} each
                                                    </span>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(item.id)}
                                                    className="p-1.5 rounded-md text-brand-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    aria-label={`Remove ${item.name}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Continue Shopping</span>
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary Column (4 cols) */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-2xs space-y-4">
                                <h2 className="text-base font-bold text-brand-secondary pb-3 border-b border-brand-border">
                                    Order Summary
                                </h2>

                                {/* Free Shipping Notification */}
                                <div className="p-3 bg-brand-surface-muted rounded-lg border border-brand-border text-xs">
                                    {isFreeShipping ? (
                                        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>You unlocked FREE Standard Delivery across India!</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-brand-secondary font-medium">
                                                <Truck className="w-4 h-4 text-brand-primary shrink-0" />
                                                <span>Add {formatPrice(amountNeededForFreeShipping)} more for FREE Delivery!</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-brand-primary h-full transition-all"
                                                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Line Items */}
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-brand-text">
                                        <span>Subtotal ({totalCount} items)</span>
                                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-brand-text">
                                        <span>Estimated Delivery (All India)</span>
                                        <span>
                                            {isFreeShipping ? (
                                                <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                                            ) : (
                                                formatPrice(shippingFee)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-brand-border flex items-baseline justify-between text-base">
                                    <span className="font-bold text-brand-secondary">Estimated Total</span>
                                    <span className="font-extrabold text-xl text-brand-secondary">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full justify-center gap-2 font-bold py-3 shadow-md"
                                    onClick={() => alert(`Order checkout simulation: Total ${formatPrice(finalTotal)} across ${totalCount} items. (Payment gateway ready for client merchant onboarding).`)}
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Button>

                                <div className="pt-2 text-center">
                                    <p className="text-[11px] text-brand-text-muted flex items-center justify-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                                        <span>Safe & verified retail shopping workflow</span>
                                    </p>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div className="bg-brand-surface border border-brand-border rounded-brand p-4 shadow-2xs space-y-2.5 text-xs text-brand-text-muted">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-brand-primary shrink-0" />
                                    <span>Standard 2–5 days dispatch across India</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4 text-brand-primary shrink-0" />
                                    <span>30-Day Hassle-Free Returns Guarantee</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                                    <span>Up to 20 products per order dispatch cap</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
