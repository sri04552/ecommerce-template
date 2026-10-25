import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Search, User, Menu, X, Layers, ChevronDown, LogOut, ShieldCheck, MapPin } from 'lucide-react';

export default function StorefrontLayout({ children, categories = [] }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { auth, storeSettings } = usePage().props;
    const user = auth?.user;

    const storeName = storeSettings?.store_name || 'Aura Store';
    const announcement = storeSettings?.announcement_text || 'Free standard delivery across India on orders over ₹999';

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
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-text-muted">
                            <Link href="/" className="hover:text-brand-primary transition-colors">
                                Home
                            </Link>
                            <Link href="/products" className="hover:text-brand-primary transition-colors">
                                All Products
                            </Link>
                            {categories.slice(0, 4).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/categories/${cat.slug}`}
                                    className="hover:text-brand-primary transition-colors"
                                >
                                    {cat.name}
                                </Link>
                            ))}
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

                                                {user.roles && (user.roles.includes('admin') || user.roles.includes('manager')) && (
                                                    <div className="pt-1 mt-1 border-t border-brand-border">
                                                        <Link
                                                            href="/admin/products"
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

                            {/* Shopping Cart Button */}
                            <Link
                                href="/cart"
                                className="relative p-2 rounded-brand text-brand-text hover:text-brand-primary hover:bg-brand-surface-muted transition-colors"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-accent"></span>
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

                {/* Mobile Navigation Dropdown */}
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
                            className="block py-2 text-sm font-medium text-brand-text hover:text-brand-primary"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2 text-sm font-medium text-brand-text hover:text-brand-primary"
                        >
                            All Products
                        </Link>

                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-sm text-brand-text-muted hover:text-brand-text"
                            >
                                {cat.name}
                            </Link>
                        ))}

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

            {/* Retail Customer-Facing Footer */}
            <footer className="bg-brand-surface border-t border-brand-border mt-16 pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-brand-border">
                        {/* Column 1: Store Bio */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-brand bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-base text-brand-secondary">{storeName}</span>
                            </div>
                            <p className="text-xs text-brand-text-muted leading-relaxed">
                                Your trusted destination for curated premium lifestyle essentials, home goods, and accessories.
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="space-y-2.5">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-brand-secondary">
                                Shop
                            </h4>
                            <ul className="space-y-1.5 text-xs text-brand-text-muted">
                                <li>
                                    <Link href="/products" className="hover:text-brand-primary transition-colors">
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/products?featured=1" className="hover:text-brand-primary transition-colors">
                                        Featured Collection
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cart" className="hover:text-brand-primary transition-colors">
                                        Shopping Cart
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Customer Care */}
                        <div className="space-y-2.5">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-brand-secondary">
                                Customer Service
                            </h4>
                            <ul className="space-y-1.5 text-xs text-brand-text-muted">
                                <li>
                                    <Link href="/account" className="hover:text-brand-primary transition-colors">
                                        Account Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/account/addresses" className="hover:text-brand-primary transition-colors">
                                        Shipping Addresses
                                    </Link>
                                </li>
                                <li>
                                    <span className="text-brand-text-muted">Support: support@aurastore.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 4: Policies & Confidence */}
                        <div className="space-y-2.5">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-brand-secondary">
                                Customer Policies
                            </h4>
                            <ul className="space-y-1.5 text-xs text-brand-text-muted">
                                <li>
                                    <span className="hover:text-brand-primary transition-colors cursor-pointer">
                                        Terms of Service
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-brand-primary transition-colors cursor-pointer">
                                        Privacy Policy
                                    </span>
                                </li>
                                <li>
                                    <span className="hover:text-brand-primary transition-colors cursor-pointer">
                                        30-Day Return Guarantee
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-muted">
                        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                        <p className="text-[11px]">Secure retail e-commerce platform.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
