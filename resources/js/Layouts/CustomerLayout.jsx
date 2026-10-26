import { Link, usePage } from '@inertiajs/react';
import StorefrontLayout from './StorefrontLayout';
import { User, MapPin, ShieldCheck, LogOut, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

export default function CustomerLayout({ title, subtitle, children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const currentUrl = usePage().url;

    const navLinks = [
        {
            name: 'Overview',
            href: '/account',
            icon: User,
            active: currentUrl === '/account',
        },
        {
            name: 'My Orders',
            href: '/account/orders',
            icon: ShoppingBag,
            active: currentUrl.startsWith('/account/orders'),
        },
        {
            name: 'Profile & Security',
            href: '/account/profile',
            icon: ShieldCheck,
            active: currentUrl.startsWith('/account/profile'),
        },
        {
            name: 'Addresses',
            href: '/account/addresses',
            icon: MapPin,
            active: currentUrl.startsWith('/account/addresses'),
        },
    ];

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Header Banner */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-brand-border">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-secondary">
                            {title || 'My Account'}
                        </h1>
                        <p className="text-sm text-brand-text-muted mt-1">
                            {subtitle || `Welcome back, ${user?.name || 'Customer'}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {user?.email_verified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Email Verified
                            </span>
                        ) : (
                            <Link
                                href="/email/verify"
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                            >
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                Verify Email
                            </Link>
                        )}

                        {user?.phone_verified && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Phone Verified
                            </span>
                        )}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Navigation Sidebar / Horizontal Tabs on Mobile */}
                    <aside className="lg:col-span-1">
                        <nav className="flex lg:flex-col gap-2 lg:gap-0 lg:space-y-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 bg-brand-surface border border-brand-border rounded-brand p-2 scrollbar-none">
                            {navLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex shrink-0 items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium rounded-brand whitespace-nowrap transition-colors ${
                                            item.active
                                                ? 'bg-brand-primary text-white shadow-xs'
                                                : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-muted'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            <div className="lg:pt-2 lg:mt-2 lg:border-t lg:border-brand-border shrink-0 flex items-center">
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex shrink-0 items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium rounded-brand text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap text-left"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    <span>Sign Out</span>
                                </Link>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Workspace */}
                    <main className="lg:col-span-3 space-y-6">
                        {flash?.success && (
                            <div className="p-4 rounded-brand border bg-emerald-50 border-emerald-200 text-emerald-900 text-sm">
                                {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="p-4 rounded-brand border bg-rose-50 border-rose-200 text-rose-900 text-sm">
                                {flash.error}
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </StorefrontLayout>
    );
}
