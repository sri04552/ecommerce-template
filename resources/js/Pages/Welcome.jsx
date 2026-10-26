import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeroCarousel from '../Components/storefront/HeroCarousel';
import ProductCard from '../Components/catalog/ProductCard';
import {
    Sparkles,
    ArrowRight,
    Truck,
    ShieldCheck,
    RotateCcw,
    CreditCard,
    Layers,
} from 'lucide-react';

export default function Welcome({
    categories = [],
    featuredProducts = [],
    newArrivals = [],
    storeName = 'Aura Store',
}) {
    return (
        <StorefrontLayout categories={categories}>
            <Head title={`${storeName} — Signature Modern Lifestyle Essentials`} />

            {/* 1. Hero Carousel Showcase */}
            <HeroCarousel />

            {/* 2. Shop By Category Showcase */}
            {categories && categories.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <div className="flex items-end justify-between mb-6 pb-2 border-b border-brand-border">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                                Curated Catalog
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-secondary tracking-tight mt-1">
                                Shop By Category
                            </h2>
                        </div>
                        <Link
                            href="/products"
                            className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                        >
                            <span>Explore All</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="group relative bg-brand-surface border border-brand-border rounded-brand p-4 text-center hover:shadow-md hover:border-brand-primary/40 transition-all duration-200 flex flex-col items-center justify-between"
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-surface-accent text-brand-primary flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="text-xs sm:text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors line-clamp-1">
                                    {category.name}
                                </h3>
                                <span className="text-[11px] text-brand-text-muted mt-0.5">
                                    {category.products_count !== undefined
                                        ? `${category.products_count} items`
                                        : 'View Collection'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. Featured Collection Section */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <div className="flex items-end justify-between mb-6 pb-2 border-b border-brand-border">
                        <div>
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-primary">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Handpicked Highlights</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-secondary tracking-tight mt-1">
                                Featured Collection
                            </h2>
                        </div>
                        <Link
                            href="/products?featured=1"
                            className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                        >
                            <span>View All Featured</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* 4. New Arrivals Section */}
            {newArrivals && newArrivals.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <div className="flex items-end justify-between mb-6 pb-2 border-b border-brand-border">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                                Fresh In Store
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-secondary tracking-tight mt-1">
                                New Arrivals
                            </h2>
                        </div>
                        <Link
                            href="/products"
                            className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 transition-colors"
                        >
                            <span>Explore Newest</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {newArrivals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {/* 5. Brand Trust & Customer Value Pillars */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-10 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-brand-surface-accent text-brand-primary border border-brand-primary/20 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-brand-secondary">
                                    100% Quality Inspected
                                </h4>
                                <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                                    Every item undergoes rigorous authenticity and durability audits before packing.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-brand-surface-accent text-brand-primary border border-brand-primary/20 flex items-center justify-center shrink-0">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-brand-secondary">
                                    Express Courier Shipping
                                </h4>
                                <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                                    Fast dispatched orders with live tracking updates directly via SMS & email.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-brand-surface-accent text-brand-primary border border-brand-primary/20 flex items-center justify-center shrink-0">
                                <RotateCcw className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-brand-secondary">
                                    3-Day Easy Return Policy
                                </h4>
                                <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                                    Hassle-free doorstep pickup with instant UPI refund turnaround.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-brand-surface-accent text-brand-primary border border-brand-primary/20 flex items-center justify-center shrink-0">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-brand-secondary">
                                    Instant UPI & COD
                                </h4>
                                <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                                    Pay securely via Google Pay, PhonePe, Cards, NetBanking, or Cash on Delivery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
