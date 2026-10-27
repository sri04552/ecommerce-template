import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, Menu, X, Layers, ChevronDown, LogOut, ShieldCheck, MapPin, Truck, Heart, Home } from 'lucide-react';
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

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const storeName = storeSettings?.store_name || 'Aura Store';
    const announcement = storeSettings?.announcement_text || 'Free standard delivery across India on orders over ₹999';
    const adminPrefix = storeSettings?.admin_prefix || 'admin';

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/products', { search: searchQuery.trim() });
        }
    };

    const handleMobileSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setMobileMenuOpen(false);
            router.get('/products', { search: searchQuery.trim() });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
            {/* Store Announcement Bar (Desktop Only) */}
            {announcement && (
                <div className="hidden lg:flex bg-brand-secondary text-brand-surface-muted border-b border-brand-primary/30 text-xs py-2 px-4 text-center font-medium items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 text-brand-primary bg-brand-surface font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
                        Special
                    </span>
                    <span>{announcement}</span>
                </div>
            )}

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-brand-surface/95 backdrop-blur-md border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Brand Logo & Name */}
                        <Link href="/" className="flex items-center gap-3 shrink-0">
                            <div className="w-9 h-9 rounded-brand bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-primary/20">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-brand-secondary">
                                {storeName}
                            </span>
                        </Link>

                        {/* Desktop Navigation Links (Desktop only) */}
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-brand-text-muted">
                            <Link href="/" className={`transition-colors ${currentUrl === '/' ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                                Home
                            </Link>
                            <Link href="/products" className={`transition-colors ${currentUrl.startsWith('/products') ? 'text-brand-primary' : 'hover:text-brand-primary'}`}>
                                All Products
                            </Link>
                        </nav>

                        {/* Search Input & Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Product Search Form (Desktop Only) */}
                            <form onSubmit={handleSearch} className="hidden lg:block relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="pl-9 pr-3 py-1.5 text-xs bg-brand-surface-muted border border-brand-border rounded-brand text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary w-48 lg:w-64 transition-all"
                                />
                            </form>

                            {/* Customer Account / Sign In (Desktop Only) */}
                            <div className="hidden lg:block relative">
                                {user ? (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-brand text-brand-text hover:bg-brand-surface-muted transition-colors text-xs font-medium border border-transparent hover:border-brand-border"
                                            aria-label="Customer Account Menu"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-semibold text-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="max-w-[120px] truncate">{user.name}</span>
                                            <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted" />
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
                                                    href="/account/orders"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3.5 py-2 text-brand-text hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <ShoppingBag className="w-4 h-4 text-brand-text-muted" />
                                                    <span>My Orders</span>
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
                                                    href="/wishlist"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-3.5 py-2 text-brand-text hover:bg-brand-surface-muted transition-colors"
                                                >
                                                    <Heart className="w-4 h-4 text-brand-primary" />
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
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text hover:text-brand-primary transition-colors border border-brand-border rounded-brand bg-brand-surface hover:bg-brand-surface-muted"
                                    >
                                        <User className="w-4 h-4 text-brand-primary" />
                                        <span>Sign In</span>
                                    </Link>
                                )}
                            </div>

                            {/* Wishlist Button (Desktop Only) */}
                            <Link
                                href="/wishlist"
                                className="hidden lg:flex relative p-2 rounded-brand text-brand-text hover:text-brand-primary hover:bg-brand-surface-muted transition-colors"
                                aria-label="Wishlist"
                                title="My Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                                {wishlistCount > 0 ? (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-accent text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                                        {wishlistCount > 20 ? '20+' : wishlistCount}
                                    </span>
                                ) : (
                                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-border"></span>
                                )}
                            </Link>

                            {/* Shopping Cart Button (Desktop Only) */}
                            <Link
                                href="/cart"
                                className="hidden lg:flex relative p-2 rounded-brand text-brand-text hover:text-brand-primary hover:bg-brand-surface-muted transition-colors"
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

                            {/* Hamburger Menu Toggle (Tablets & Mobile Devices Only) */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-brand text-brand-secondary hover:bg-brand-surface-muted lg:hidden border border-brand-border flex items-center gap-1.5 transition-colors"
                                aria-label="Toggle Navigation Menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile & Tablet Drawer Menu (Off-Canvas Side Drawer Outside Header to avoid stacking context traps) */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Overlay backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Slide-out Drawer Panel */}
                    <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
                        <div>
                            {/* Drawer User Greeting Header */}
                            <div className="bg-gradient-to-r from-brand-secondary to-slate-900 text-white p-5">
                                <div className="flex items-center justify-between pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-brand bg-brand-primary flex items-center justify-center font-bold text-white text-sm">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-base tracking-tight">{storeName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                                        aria-label="Close menu"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {user ? (
                                    <div className="pt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                                <p className="text-xs text-slate-300 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-2">
                                        <p className="text-xs text-slate-300">Welcome to {storeName}</p>
                                        <Link
                                            href="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="mt-2.5 inline-flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors"
                                        >
                                            <User className="w-4 h-4 text-brand-primary" />
                                            <span>Sign In / Create Account</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Search Bar Inside Hamburger Menu (Tablets & Mobile) */}
                            <form onSubmit={handleMobileSearch} className="p-3.5 bg-brand-surface-muted border-b border-brand-border">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products, brands, deals..."
                                        className="w-full pl-9 pr-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all shadow-2xs"
                                    />
                                </div>
                            </form>

                            {/* Commerce Quick Actions: Profile, Cart, Wishlist */}
                            <div className="p-4 border-b border-brand-border bg-brand-surface-muted/60 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted px-1">
                                    Commerce Essentials
                                </p>

                                {/* Cart Option inside Hamburger */}
                                <Link
                                    href="/cart"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-primary hover:bg-brand-surface-accent/40 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-surface-accent text-brand-primary flex items-center justify-center">
                                            <ShoppingBag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-brand-text block">My Cart</span>
                                            <span className="text-[11px] text-brand-text-muted block">View shopping bag</span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-white text-xs font-extrabold font-mono">
                                        {cartCount}
                                    </span>
                                </Link>

                                {/* Wishlist Option inside Hamburger */}
                                <Link
                                    href="/wishlist"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-primary hover:bg-brand-surface-accent/40 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-surface-accent text-brand-primary flex items-center justify-center">
                                            <Heart className="w-4 h-4 fill-brand-primary/20" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-brand-text block">My Wishlist</span>
                                            <span className="text-[11px] text-brand-text-muted block">Saved favorites</span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-white text-xs font-extrabold font-mono">
                                        {wishlistCount}
                                    </span>
                                </Link>

                                {/* Profile Option inside Hamburger */}
                                <Link
                                    href={user ? '/account' : '/login'}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-primary hover:bg-brand-surface-accent/40 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-brand-surface-accent text-brand-primary flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-brand-text block">
                                                {user ? 'My Profile & Account' : 'Sign In'}
                                            </span>
                                            <span className="text-[11px] text-brand-text-muted block">
                                                {user ? 'Orders & saved addresses' : 'Access your account'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-brand-text-muted -rotate-90" />
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="p-4 space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                                    Store Navigation
                                </p>

                                <Link
                                    href="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                        currentUrl === '/' ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Home</span>
                                </Link>

                                <Link
                                    href="/products"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                        currentUrl.startsWith('/products') ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>All Products Catalog</span>
                                </Link>

                                <Link
                                    href="/track"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    <Truck className="w-4 h-4 text-slate-500" />
                                    <span>Track Live Order</span>
                                </Link>
                            </div>

                            {/* Categories List */}
                            {categories && categories.length > 0 && (
                                <div className="p-4 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                                        Shop By Category
                                    </p>
                                    <div className="space-y-0.5">
                                        {categories.slice(0, 6).map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/categories/${cat.slug}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 hover:text-brand-primary hover:bg-brand-surface-muted rounded-lg transition-colors"
                                            >
                                                <span>{cat.name}</span>
                                                <span className="text-[10px] text-slate-400">View</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Link (Only for admin/manager) */}
                            {user?.roles && (user.roles.includes('admin') || user.roles.includes('manager')) && (
                                <div className="p-4 pt-2 border-t border-slate-100">
                                    <Link
                                        href={`/${adminPrefix}/dashboard`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between p-2.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-bold hover:bg-brand-primary/15 transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-brand-primary" />
                                            <span>Store Admin Panel</span>
                                        </span>
                                        <span>&rarr;</span>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer Sign Out */}
                        {user && (
                            <div className="p-4 border-t border-slate-100 bg-slate-50">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Storefront Content */}
            <main className="flex-1">{children}</main>

            {/* Premium Distinctive Brand Footer */}
            <footer className="bg-brand-text text-slate-300 border-t border-white/10 mt-0">
                {/* Footer Main Links */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-12 pb-10 border-b border-white/10">
                        {/* Column 1: Store Bio */}
                        <div className="w-full lg:max-w-[280px] space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-primary/20">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-lg text-white tracking-tight">{storeName}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Premium Indian online retail destination. Discover handpicked electronics, lifestyle trends, apparel, and home essentials with guaranteed transparent pricing.
                            </p>
                            <div className="text-xs text-slate-300 space-y-1.5">
                                <p><span className="text-white font-semibold">Customer Support:</span> 10 AM – 7 PM IST</p>
                                <p><span className="text-white font-semibold">Email:</span> support@ecommerce-store.in</p>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="w-full lg:w-auto space-y-3">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-white">
                                Shop Categories
                            </h4>
                            <ul className="space-y-2 text-xs text-slate-300">
                                <li>
                                    <Link href="/products" className="hover:text-white transition-colors">
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/products?featured=1" className="hover:text-white transition-colors">
                                        Today's Deals & Offers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/wishlist" className="hover:text-white transition-colors">
                                        My Wishlist
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-white transition-colors">
                                        Shopping Bag ({cartCount})
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track" className="hover:text-white transition-colors">
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
                            <ul className="space-y-2 text-xs text-slate-300">
                                <li>
                                    <Link href="/account" className="hover:text-white transition-colors">
                                        My Profile & Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/account/addresses" className="hover:text-white transition-colors">
                                        Saved Delivery Addresses
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/track" className="hover:text-white transition-colors">
                                        Live Shipment Tracking
                                    </Link>
                                </li>
                                <li>
                                    <span className="hover:text-white transition-colors cursor-pointer">
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
                            <p className="text-xs text-slate-300 leading-relaxed">
                                We accept UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, Net Banking, and Cash on Delivery.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 bg-white/10 border border-white/15 rounded text-[11px] font-medium text-slate-200">
                                    UPI / QR
                                </span>
                                <span className="px-2.5 py-1 bg-white/10 border border-white/15 rounded text-[11px] font-medium text-slate-200">
                                    RuPay
                                </span>
                                <span className="px-2.5 py-1 bg-white/10 border border-white/15 rounded text-[11px] font-medium text-slate-200">
                                    Visa / MC
                                </span>
                                <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded text-[11px] font-medium text-emerald-300">
                                    Cash on Delivery
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-2">
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
