import { useState } from 'react';
import { Link, usePage, Head } from '@inertiajs/react';
import {
    Package,
    FolderTree,
    Warehouse,
    Store,
    LogOut,
    Menu,
    X,
    Shield,
    CheckCircle2,
    AlertCircle,
    User,
    ArrowUpRight,
} from 'lucide-react';

export default function AdminLayout({ title, subtitle, actions, children }) {
    const { auth, flash, storeSettings } = usePage().props;
    const user = auth?.user;
    const currentUrl = usePage().url;
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        {
            name: 'Products',
            href: '/admin/products',
            icon: Package,
            active: currentUrl.startsWith('/admin/products'),
        },
        {
            name: 'Categories',
            href: '/admin/categories',
            icon: FolderTree,
            active: currentUrl.startsWith('/admin/categories'),
        },
        {
            name: 'Inventory',
            href: '/admin/inventory',
            icon: Warehouse,
            active: currentUrl.startsWith('/admin/inventory'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
            <Head title={title ? `${title} — Admin Panel` : 'Admin Panel'} />

            {/* Mobile Header */}
            <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                        A
                    </div>
                    <div>
                        <span className="font-semibold text-sm tracking-tight text-white block">
                            {storeSettings?.store_name || 'Store'} Admin
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">Commerce Engine</span>
                    </div>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                    aria-label="Toggle Navigation"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex flex-1">
                {/* Desktop & Mobile Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="p-5">
                        {/* Logo / Brand Header */}
                        <div className="hidden lg:flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
                            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="font-bold text-base text-white tracking-tight block">
                                    {storeSettings?.store_name || 'Store'}
                                </span>
                                <span className="text-xs text-indigo-400 font-medium tracking-wide uppercase">
                                    Administration
                                </span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                                Catalog & Stock
                            </p>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            item.active
                                                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Storefront Link */}
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <Link
                                href="/"
                                target="_blank"
                                className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Store className="w-4 h-4 text-emerald-400" />
                                    <span>View Storefront</span>
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Admin User & Logout */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
                                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 rounded-lg transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </Link>
                    </div>
                </aside>

                {/* Mobile Backdrop */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Main Content Viewport */}
                <main className="flex-1 min-w-0 flex flex-col">
                    {/* Top Content Header */}
                    <div className="bg-white border-b border-slate-200 px-6 py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {title || 'Dashboard'}
                                </h1>
                                {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                            </div>
                            {actions && <div className="flex items-center gap-3">{actions}</div>}
                        </div>
                    </div>

                    {/* Flash messages */}
                    <div className="max-w-7xl w-full mx-auto px-6 pt-4">
                        {flash?.success && (
                            <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3 shadow-xs">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span>{flash.error}</span>
                            </div>
                        )}
                    </div>

                    {/* Page Content Body */}
                    <div className="max-w-7xl w-full mx-auto p-6 flex-1">{children}</div>
                </main>
            </div>
        </div>
    );
}
