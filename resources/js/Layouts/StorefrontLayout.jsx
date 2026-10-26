import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, Menu, X, Layers, ChevronDown, LogOut, ShieldCheck, MapPin, RotateCcw, Truck, CreditCard, Heart } from 'lucide-react';
import { getCartCount, onCartChange } from '../utils/cart';
import { getWishlistCount } from '../utils/wishlist';

export default function StorefrontLayout({ children, categories = [] }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const { auth, storeSettings } = usePage().props;
    const user = auth?.user;

    useEffect(() => {
        setCartCount(getCartCount());
        setWishlistCount(getWishlistCount());

        const unsubscribe = onCartChange((detail) => {
            setCartCount(detail?.count ?? getCartCount());
        });

        const handleWishlistChange = (e) => {
            setWishlistCount(e.detail?.count ?? getWishlistCount());
        };
        window.addEventListener('aura-wishlist-updated', handleWishlistChange);

        return () => {
            unsubscribe();
            window.removeEventListener('aura-wishlist-updated', handleWishlistChange);
        };
    }, []);

    const storeName = storeSettings?.store_name || 'Aura Store';
    const announcement = storeSettings?.announcement_text || 'Free standard delivery across India on orders over ₹999';
    const adminPrefix = storeSettings?.admin_prefix || 'admin';

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/products', { search: searchQuery.trim() });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-surface-muted text-brand-text">
            {/* Store Announcement Bar */}
            {announcement && (
                <div className="bg-brand-secondary text-white text-xs py-2 px-4 text-center font-medium">
                    <span>{announcement}</span>
                </div>
            )}

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-brand-surface/95 backdrop-blur-md border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Brand Logo & Name */}
                        <Link href="/" className="flex items-center gap-3 shrink-0">
                            <div className="w-9 h-9 rounded-brand bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-xs">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-brand-secondary">
                                {storeName}
                            </span>
                        </Link>

                        {/* Desktop Navigation Links (Home and All Products only) */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-text-muted">
                            <Link href="/" className="hover:text-brand-primary transition-colors">
                                Home
                            </Link>
                            <Link href="/products" className="hover:text-brand-primary transition-colors">
                                All Products
                            </Link>
                        </nav>

                        {/* Search Input & Actions */}
                        <div className="flex items-center gap-3">
                            {/* Product Search Form */}
                            <form onSubmit={handleSearch} className="hidden sm:block relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="pl-9 pr-4 py-1.5 text-xs bg-brand-surface-muted border border-brand-border rounded-brand text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary w-48 lg:w-60 transition-all"
                                />
                            </form>

                            {/* Customer Account / Sign In */}
                            <div className="relative">
                                {user ? (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-brand text-brand-text hover:bg-brand-surface-muted transition-colors text-xs font-medium border border-transparent hover:border-brand-border"
                                            aria-label="Customer Account Menu"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-semibold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="hidden lg:inline max-w-[120px] truncate">{user.name}</span>
                                            <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted hidden sm:inline" />
                                        </button>

                                        {userDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-52 bg-brand-surface border border-brand-border rounded-brand shadow-lg py-1.5 z-50 text-xs">
                                                <div className="px-3.5 py-2 border-b border-brand-border">
                                                    <p className="font-semibold text-brand-secondary truncate">{user.name}</p>
                                                    <p className="text-brand-text-muted text-[11px] truncate">{user.email}</p>
                                                </div>

                                                <Link
                                                    href="/account"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3.5 py-2 text-brand-text hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-brand-text-muted" />
                                                    <span>Account Dashboard</span>
                                                </Link>

                                                <Link
                                                    href="/account/profile"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3.5 py-2 text-brand-text hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <ShieldCheck className="w-4 h-4 text-brand-text-muted" />
                                                    <span>Profile & Security</span>
                                                </Link>

                                                <Link
                                                    href="/account/addresses"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3.5 py-2 text-brand-text hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <MapPin className="w-4 h-4 text-brand-text-muted" />
                                                    <span>Addresses</span>
                                                </Link>

                                                <Link
                                                    href="/account/wishlist"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3.5 py-2 text-brand-text hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <Heart className="w-4 h-4 text-rose-500" />
                                                    <span>My Wishlist</span>
                                                </Link>

                                                {user.roles && (user.roles.includes('admin') || user.roles.includes('manager')) && (
                                                    <div className="pt-1 mt-1 border-t border-brand-border">
                                                        <Link
                                                            href={`/${adminPrefix}/dashboard`}
                                                            onClick={() => setUserDropdownOpen(false)}
                                                            className="flex items-center gap-2.5 px-3.5 py-2 text-brand-primary font-semibold hover:bg-brand-surface-muted transition-colors"
                                                        >
                                                            <span>Store Management</span>
                                                        </Link>
                                                    </div>
                                                )}

                                                <div className="pt-1 mt-1 border-t border-brand-border">
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span>Sign Out</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-text hover:text-brand-primary transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        <span className="hidden sm:inline">Sign In</span>
                                    </Link>
                                )}
                            </div>

                            {/* Wishlist Button */}
                            <Link
                                href="/wishlist"
                                className="relative p-2 rounded-brand text-brand-text hover:text-rose-500 hover:bg-brand-surface-muted transition-colors"
                                aria-label="Wishlist"
                                title="My Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                                {wishlistCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                                        {wishlistCount > 20 ? '20+' : wishlistCount}
                                    </span>
                                ) : (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                )}
                            </Link>

                            {/* Shopping Cart Button */}
                            <Link
                                href="/cart"
                                className="relative p-2 rounded-brand text-brand-text hover:text-brand-primary hover:bg-brand-surface-muted transition-colors"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {cartCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                                        {cartCount > 20 ? '20+' : cartCount}
                                    </span>
                                ) : (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                )}
                            </Link>

                            {/* Mobile Hamburger Toggle */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-brand text-brand-text-muted hover:text-brand-text md:hidden"
                                aria-label="Toggle Navigation Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown (Home and All Products only) */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-brand-border bg-brand-surface px-4 pt-3 pb-5 space-y-3">
                        <form onSubmit={handleSearch} className="relative mb-3">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-9 pr-4 py-2 text-xs bg-brand-surface-muted border border-brand-border rounded-brand text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                        </form>

                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-semibold text-brand-text hover:text-brand-primary"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-semibold text-brand-text hover:text-brand-primary"
                        >
                            All Products
                        </Link>
                        <Link
                            href="/wishlist"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between py-2 text-sm font-semibold text-brand-text hover:text-rose-500"
                        >
                            <span>My Wishlist</span>
                            {wishlistCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <div className="pt-3 border-t border-brand-border">
                            {user ? (
                                <>
                                    <Link
                                        href="/account"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-2 text-sm font-semibold text-brand-primary"
                                    >
                                        My Account ({user.name})
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="block py-1.5 text-sm text-rose-600 font-medium"
                                    >
                                        Sign Out
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-sm font-semibold text-brand-primary"
                                >
                                    Sign In / Register
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Storefront Content */}
            <main className="flex-1">{children}</main>

            {/* Premium Dark E-Commerce Footer */}
            <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-0">
                {/* Footer Main Links */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
                        {/* Column 1: Store Bio */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-lg text-white tracking-tight">{storeName}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Premium Indian online retail destination. Discover handpicked electronics, lifestyle trends, apparel, and home essentials with guaranteed transparent pricing.
                            </p>
                            <div className="text-xs text-slate-400 space-y-1">
                                <p><span className="text-slate-300 font-medium">Customer Support:</span> 10 AM – 7 PM IST</p>
                                <p><span className="text-slate-300 font-medium">Email:</span> support@ecommerce-store.in</p>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                                Shop Categories
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-400">
                                <li>
                                    <Link href="/products" className="hover:text-indigo-400 transition-colors">
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/products?featured=1" className="hover:text-indigo-400 transition-colors">
                                        Today's Deals & Offers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-indigo-400 transition-colors">
                                        Shopping Bag ({cartCount})
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track" className="hover:text-indigo-400 transition-colors">
                                        Track Your Order
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Customer Care & Returns */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                                Customer Care
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-400">
                                <li>
                                    <Link href="/account" className="hover:text-indigo-400 transition-colors">
                                        My Profile & Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/account/addresses" className="hover:text-indigo-400 transition-colors">
                                        Saved Delivery Addresses
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track" className="hover:text-indigo-400 transition-colors">
                                        Live Shipment Tracking
                                    </Link>
                                </li>
                                <li>
                                    <span className="hover:text-indigo-400 transition-colors cursor-pointer">
                                        Returns & UPI Refund Policy
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Payment Methods & Trust */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                                100% Secure Payments
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                We accept UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, Net Banking, and Cash on Delivery.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-semibold text-slate-200">
                                    UPI / QR
                                </span>
                                <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-semibold text-slate-200">
                                    RuPay
                                </span>
                                <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-semibold text-slate-200">
                                    Visa / MC
                                </span>
                                <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[11px] font-semibold text-emerald-400">
                                    Cash on Delivery
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>256-Bit SSL Encrypted Checkout</span>
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                        <p className="text-[11px] text-slate-400">
                            Designed for high-performance retail commerce across India.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
