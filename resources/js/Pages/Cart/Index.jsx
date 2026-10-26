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
    Banknote,
    CreditCard,
    X,
    MapPin,
    AlertCircle,
    Tag,
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
    const { auth, storeSettings } = usePage().props;
    const user = auth?.user;
    const currency = storeSettings?.currency_symbol || '₹';

    const [cart, setCart] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [alertMessage, setAlertMessage] = useState(null);

    // Checkout Modal State
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);
    const [customerName, setCustomerName] = useState(user?.name || '');
    const [customerEmail, setCustomerEmail] = useState(user?.email || '');
    const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');

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

    const totalDeliveryFee = cart.reduce(
        (sum, item) => sum + ((parseFloat(item.deliveryFee) || 0) * (parseInt(item.quantity, 10) || 1)),
        0
    );
    const isFreeDelivery = totalDeliveryFee === 0;
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(null);
    const [couponSuccess, setCouponSuccess] = useState(null);

    const handleApplyCoupon = async (e) => {
        if (e) e.preventDefault();
        const code = couponCodeInput.trim().toUpperCase();
        if (!code) return;
        setCouponLoading(true);
        setCouponError(null);
        setCouponSuccess(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/coupons/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    coupon_code: code,
                    cart_subtotal: subtotal,
                }),
            });

            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon(data);
                setCouponSuccess(data.message);
                setCouponError(null);
            } else {
                setCouponError(data.message || 'Invalid coupon code.');
                setAppliedCoupon(null);
            }
        } catch (err) {
            setCouponError('Network error applying coupon. Please try again.');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponSuccess(null);
        setCouponError(null);
        setCouponCodeInput('');
    };

    const discountAmount = appliedCoupon?.discount_amount ? parseFloat(appliedCoupon.discount_amount) : 0;
    const finalTotal = Math.max(0, subtotal + totalDeliveryFee - discountAmount);

    const limitPercentage = Math.min(100, Math.round((totalCount / MAX_CART_LIMIT) * 100));

    const hasNonCodItem = cart.some((item) => item.codAvailable === false);

    const handleOpenCheckout = () => {
        if (hasNonCodItem && paymentMethod === 'cod') {
            setPaymentMethod('prepaid');
        }
        setCheckoutOpen(true);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setCheckoutError(null);
        setCheckoutLoading(true);

        const payload = {
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim(),
            customer_phone: customerPhone.trim(),
            street_address: streetAddress.trim(),
            city: city.trim(),
            state: state.trim(),
            postal_code: postalCode.trim(),
            payment_method: paymentMethod,
            coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
            cart_items: cart,
        };

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/checkout/place-order', {
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
                clearCart();
                setCheckoutOpen(false);
                window.location.href = data.redirect_url || `/track?order_number=${data.order_number}`;
            } else {
                setCheckoutError(data.message || 'Failed to place order. Please check required fields.');
            }
        } catch (err) {
            setCheckoutError('A network error occurred while placing your order. Please retry.');
        } finally {
            setCheckoutLoading(false);
        }
    };

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

                                {/* Free / Custom Delivery Notification */}
                                <div className="p-3 bg-brand-surface-muted rounded-lg border border-brand-border text-xs">
                                    {isFreeDelivery ? (
                                        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>All items in your cart qualify for FREE Delivery!</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-brand-secondary font-medium">
                                            <Truck className="w-4 h-4 text-brand-primary shrink-0" />
                                            <span>Order Delivery Fee: {formatPrice(totalDeliveryFee)}</span>
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
                                        <span>Delivery Fee</span>
                                        <span>
                                            {isFreeDelivery ? (
                                                <strong className="text-emerald-600 uppercase font-bold">FREE</strong>
                                            ) : (
                                                formatPrice(totalDeliveryFee)
                                            )}
                                        </span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-semibold">
                                            <span>Coupon Discount ({appliedCoupon?.coupon_code})</span>
                                            <span className="font-mono">-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Promo Code / Coupon Section */}
                                <div className="pt-2 border-t border-brand-border">
                                    {appliedCoupon ? (
                                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <div>
                                                    <span className="font-bold text-emerald-800 font-mono tracking-wider">{appliedCoupon.coupon_code}</span>
                                                    <p className="text-[11px] text-emerald-600 font-medium">You save {formatPrice(discountAmount)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                                            <label className="block text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
                                                Have a Promo Code?
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCodeInput}
                                                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                                    placeholder="Enter code (e.g. FESTIVE20)"
                                                    className="flex-1 px-3 py-1.5 text-xs uppercase font-mono font-bold bg-brand-surface-muted border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={couponLoading || !couponCodeInput.trim()}
                                                    className="px-3 py-1.5 text-xs font-bold bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 disabled:opacity-50 transition-colors"
                                                >
                                                    {couponLoading ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponError && (
                                                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{couponError}</span>
                                                </p>
                                            )}
                                            {couponSuccess && (
                                                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{couponSuccess}</span>
                                                </p>
                                            )}
                                        </form>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-brand-border flex items-baseline justify-between text-base">
                                    <span className="font-bold text-brand-secondary">Total Payable</span>
                                    <span className="font-extrabold text-xl text-brand-secondary">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full justify-center gap-2 font-bold py-3 shadow-md"
                                    onClick={handleOpenCheckout}
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
                                    <span>3-Day Hassle-Free Returns Guarantee</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                                    <span>Up to 20 products per order dispatch cap</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Checkout Modal */}
                {checkoutOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Delivery & Payment Details</h3>
                                    <p className="text-xs text-slate-500">Provide shipping address to place your order</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCheckoutOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
                                {checkoutError && (
                                    <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{checkoutError}</span>
                                    </div>
                                )}

                                {/* Customer Info */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            required
                                            placeholder="Enter your full name"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                required
                                                placeholder="Order confirmation email"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                required
                                                placeholder="10-digit mobile number"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                                        <span>Shipping Address</span>
                                    </p>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Street / Flat / Colony / Area *
                                        </label>
                                        <input
                                            type="text"
                                            value={streetAddress}
                                            onChange={(e) => setStreetAddress(e.target.value)}
                                            required
                                            placeholder="House no, Building, Street address"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required
                                                placeholder="City"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                required
                                                placeholder="State"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                PIN Code *
                                            </label>
                                            <input
                                                type="text"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                required
                                                placeholder="6-digit PIN"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Selection (COD / Prepaid) */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-900 mb-1">
                                        Payment Method
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {/* COD Option */}
                                        <div
                                            onClick={() => !hasNonCodItem && setPaymentMethod('cod')}
                                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                                hasNonCodItem
                                                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                                                    : paymentMethod === 'cod'
                                                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="checkoutPayment"
                                                    value="cod"
                                                    disabled={hasNonCodItem}
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={() => !hasNonCodItem && setPaymentMethod('cod')}
                                                    className="text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                                    <Banknote className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>Cash on Delivery</span>
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 pl-5">
                                                {hasNonCodItem
                                                    ? 'Unavailable: Cart contains prepaid-only item.'
                                                    : 'Pay with cash or UPI at delivery doorstep.'}
                                            </p>
                                        </div>

                                        {/* Prepaid Online Option */}
                                        <div
                                            onClick={() => setPaymentMethod('prepaid')}
                                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                                paymentMethod === 'prepaid'
                                                    ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="checkoutPayment"
                                                    value="prepaid"
                                                    checked={paymentMethod === 'prepaid'}
                                                    onChange={() => setPaymentMethod('prepaid')}
                                                    className="text-emerald-600 focus:ring-emerald-500"
                                                />
                                                <span className="font-bold text-slate-900 flex items-center gap-1">
                                                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Prepaid Online</span>
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-1 pl-5">
                                                Instant UPI, Cards & NetBanking dispatch priority.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order summary */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Items ({totalCount})</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Delivery Charges</span>
                                        <span className="font-semibold">{isFreeDelivery ? 'FREE' : formatPrice(totalDeliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                                        <span>Total Amount</span>
                                        <span>{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCheckoutOpen(false)}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={checkoutLoading}
                                        className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{checkoutLoading ? 'Placing Order...' : 'Confirm & Place Order'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
