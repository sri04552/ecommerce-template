import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingBag, Search, User, Menu, X, Layers, Sparkles } from 'lucide-react';

export default function StorefrontLayout({ children, storeName = 'Ecommerce Store' }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="min-h-screen flex flex-col bg-brand-surface-muted text-brand-text">
            {/* Top Announcement Bar */}
            <div className="bg-brand-secondary text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                <span>Client Architecture: Dedicated Instance Template • Phase 1 Foundation</span>
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-brand-surface/90 backdrop-blur-md border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Brand Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-brand bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-xs">
                                <Layers className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-brand-secondary">
                                {storeName}
                            </span>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-text-muted">
                            <a href="#" className="text-brand-primary transition-colors">
                                Home
                            </a>
                            <a href="#features" className="hover:text-brand-text transition-colors">
                                Architecture
                            </a>
                            <a href="#tokens" className="hover:text-brand-text transition-colors">
                                Design Tokens
                            </a>
                            <a href="#stack" className="hover:text-brand-text transition-colors">
                                Tech Stack
                            </a>
                        </nav>

                        {/* Storefront Actions */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    readOnly
                                    className="pl-9 pr-4 py-1.5 text-xs bg-brand-surface-muted border border-brand-border rounded-brand text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary w-44"
                                />
                            </div>

                            <Link
                                href={user ? '/account' : '/login'}
                                aria-label={user ? 'Customer Account' : 'Sign In'}
                                className="p-2 rounded-brand text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-muted transition-colors flex items-center gap-1.5 text-xs font-medium"
                            >
                                <User className="w-5 h-5" />
                                {user ? (
                                    <span className="hidden xl:inline max-w-[100px] truncate">{user.name}</span>
                                ) : (
                                    <span className="hidden xl:inline">Sign In</span>
                                )}
                            </Link>

                            <button
                                type="button"
                                aria-label="Shopping Cart"
                                className="relative p-2 rounded-brand text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-muted transition-colors"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-accent"></span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-brand text-brand-text-muted hover:text-brand-text"
                                aria-label="Toggle navigation menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-b border-brand-border bg-brand-surface px-4 pt-2 pb-4 space-y-2">
                        <a href="#" className="block py-2 text-sm font-medium text-brand-primary">
                            Home
                        </a>
                        <a
                            href="#features"
                            className="block py-2 text-sm font-medium text-brand-text-muted"
                        >
                            Architecture
                        </a>
                        <a
                            href="#tokens"
                            className="block py-2 text-sm font-medium text-brand-text-muted"
                        >
                            Design Tokens
                        </a>
                        <a
                            href="#stack"
                            className="block py-2 text-sm font-medium text-brand-text-muted"
                        >
                            Tech Stack
                        </a>
                        <div className="pt-2 border-t border-brand-border">
                            <Link
                                href={user ? '/account' : '/login'}
                                className="block py-2 text-sm font-semibold text-brand-primary"
                            >
                                {user ? `My Account (${user.name})` : 'Sign In / Register'}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-brand-surface border-t border-brand-border mt-16 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-text-muted">
                        <p>
                            © {new Date().getFullYear()} {storeName}. Built with modular agency
                            architecture.
                        </p>
                        <div className="flex items-center gap-4">
                            <span>Dual Target: Shared Hosting & VPS</span>
                            <span>•</span>
                            <span>Laravel 12 + Inertia + React + Tailwind</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
