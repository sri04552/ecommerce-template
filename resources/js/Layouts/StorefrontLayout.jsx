import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, Menu, X, Layers, ChevronDown, LogOut, ShieldCheck, MapPin, RotateCcw, Truck, CreditCard, Heart, Home, Info } from 'lucide-react';
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
    const currentUrl = usePage().url;

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

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-brand-text-muted">
                            <Link href="/" className={`transition-colors ${currentUrl === '/' ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                                Home
                            </Link>
                            <Link href="/products" className={`transition-colors ${currentUrl.startsWith('/products') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                                All Products
                            </Link>
                            <Link href="/about" className={`transition-colors ${currentUrl === '/about' ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                                About Us
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

                {/* Mobile Navigation Drawer & Backdrop */}
                {mobileMenuOpen && (
                    <>
                        {/* Overlay backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Slide-down Drawer Panel */}
                        <div className="md:hidden fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto bg-brand-surface z-50 border-b border-brand-border px-5 py-5 space-y-4 shadow-2xl animate-fadeIn">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products, brands, essentials..."
                                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-brand-surface-muted border border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </form>

                            <nav className="space-y-1">
                                <Link
                                    href="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                        currentUrl === '/' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Home</span>
                                </Link>

                                <Link
                                    href="/products"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                        currentUrl.startsWith('/products') ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>All Products</span>
                                </Link>

                                <Link
                                    href="/about"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                        currentUrl === '/about' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <Info className="w-4 h-4" />
                                    <span>About Us & Our Story</span>
                                </Link>

                                <Link
                                    href="/wishlist"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-4 h-4 text-rose-500" />
                                        <span>My Wishlist</span>
                                    </div>
                                    {wishlistCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="w-4 h-4 text-brand-primary" />
                                        <span>Shopping Bag</span>
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-brand-primary text-white text-[10px] font-bold">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    href="/track"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <Truck className="w-4 h-4 text-indigo-500" />
                                    <span>Track Your Shipment</span>
                                </Link>
                            </nav>

                            <div className="pt-3 border-t border-brand-border">
                                {user ? (
                                    <div className="space-y-1">
                                        <div className="px-3 py-1.5 mb-1 bg-slate-50 rounded-lg">
                                            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/account"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                        >
                                            My Profile & Addresses
                                        </Link>

                                        <Link
                                            href="/account/orders"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                                        >
                                            Order History & Returns
                                        </Link>

                                        {user.roles && (user.roles.includes('admin') || user.roles.includes('manager')) && (
                                            <Link
                                                href={`/${adminPrefix}/dashboard`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                            >
                                                Store Admin Panel &rarr;
                                            </Link>
                                        )}

                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                                        >
                                            Sign Out
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-brand-primary rounded-xl shadow-xs"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Sign In / Register</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </header>

            {/* Main Storefront Content */}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>

            {/* Mobile Bottom Navigation Bar (Persistent one-thumb navigation) */}
            <nav
                aria-label="Mobile Bottom Navigation"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg"
            >
                <Link
                    href="/"
                    className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
                        currentUrl === '/' ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px]">Home</span>
                </Link>

                <Link
                    href="/products"
                    className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
                        currentUrl.startsWith('/products') ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px]">Catalog</span>
                </Link>

                <Link
                    href="/wishlist"
                    className={`relative flex flex-col items-center gap-0.5 p-1 transition-colors ${
                        currentUrl.startsWith('/wishlist') ? 'text-rose-500 font-bold' : 'text-slate-500 hover:text-rose-500'
                    }`}
                >
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                        <span className="absolute top-0 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                        </span>
                    )}
                    <span className="text-[10px]">Wishlist</span>
                </Link>

                <Link
                    href="/cart"
                    className={`relative flex flex-col items-center gap-0.5 p-1 transition-colors ${
                        currentUrl === '/cart' ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-brand-primary'
                    }`}
                >
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                        <span className="absolute top-0 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center">
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                    <span className="text-[10px]">Bag</span>
                </Link>

                <Link
                    href={user ? '/account' : '/login'}
                    className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
                        currentUrl.startsWith('/account') ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <User className="w-5 h-5" />
                    <span className="text-[10px]">{user ? 'Account' : 'Sign In'}</span>
                </Link>
            </nav>

            {/* Premium Dark E-Commerce Footer */}
            <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-0">
                {/* Footer Main Links */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-12 pb-10 border-b border-slate-800">
                        {/* Column 1: Store Bio */}
                        <div className="w-full lg:max-w-[280px] space-y-4">
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
                        <div className="w-full lg:w-auto space-y-3">
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
                                    <Link href="/about" className="hover:text-indigo-400 transition-colors">
                                        About Our Story
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/products?featured=1" className="hover:text-indigo-400 transition-colors">
                                        Today's Deals & Offers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/wishlist" className="hover:text-indigo-400 transition-colors">
                                        My Wishlist
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
                        <div className="w-full lg:w-auto space-y-3">
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
                        <div className="w-full lg:max-w-[280px] space-y-3">
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
