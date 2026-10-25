import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import ProductCard from '../Components/catalog/ProductCard';
import Button from '../Components/ui/Button';
import HeroCarousel from '../Components/storefront/HeroCarousel';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, ShoppingBag } from 'lucide-react';

export default function Welcome({
    featuredProducts = [],
    newArrivals = [],
    categories = [],
    heroBanner = null,
    storeName = 'Aura Store',
}) {
    const banner = heroBanner || {
        title: 'Modern Essentials for Everyday Living',
        subtitle: 'Discover our curated collection of premium goods engineered for quality, function, and comfort.',
        cta_text: 'Explore Catalog',
        cta_url: '/products',
    };

    return (
        <StorefrontLayout categories={categories}>
            <Head title={`${storeName} — Modern Lifestyle Essentials`} />

            {/* Auto-sliding 100dvh Hero Showcase */}
            <HeroCarousel />

            {/* Value Propositions */}
            <section className="py-8 bg-brand-surface border-b border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="flex flex-col items-center space-y-1.5">
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-1">
                                <Truck className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-xs text-brand-secondary">Free Shipping</h4>
                            <p className="text-[11px] text-brand-text-muted">On eligible orders over $75</p>
                        </div>

                        <div className="flex flex-col items-center space-y-1.5">
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-1">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-xs text-brand-secondary">Guaranteed Quality</h4>
                            <p className="text-[11px] text-brand-text-muted">Directly sourced premium materials</p>
                        </div>

                        <div className="flex flex-col items-center space-y-1.5">
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-1">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-xs text-brand-secondary">Hassle-Free Returns</h4>
                            <p className="text-[11px] text-brand-text-muted">30-day customer satisfaction guarantee</p>
                        </div>

                        <div className="flex flex-col items-center space-y-1.5">
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-1">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <h4 className="font-semibold text-xs text-brand-secondary">Secure Shopping</h4>
                            <p className="text-[11px] text-brand-text-muted">Protected customer account data</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            {categories.length > 0 && (
                <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                                Shop by Category
                            </h2>
                            <p className="text-xs text-brand-text-muted mt-1">
                                Browse our curated catalog across popular departments
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.slice(0, 4).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="group relative p-6 bg-brand-surface border border-brand-border rounded-brand hover:border-brand-primary transition-colors text-center"
                            >
                                <div className="w-12 h-12 rounded-full bg-brand-surface-muted group-hover:bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3 transition-colors">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-sm text-brand-secondary group-hover:text-brand-primary transition-colors">
                                    {cat.name}
                                </h3>
                                {cat.products_count !== undefined && (
                                    <p className="text-xs text-brand-text-muted mt-1">
                                        {cat.products_count} {cat.products_count === 1 ? 'item' : 'items'}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Products Section */}
            <section className="py-12 sm:py-16 bg-brand-surface border-y border-brand-border w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                                Featured Products
                            </h2>
                            <p className="text-xs text-brand-text-muted mt-1">
                                Handpicked favorites chosen for design and craftsmanship
                            </p>
                        </div>
                        <Link
                            href="/products"
                            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                        >
                            <span>Browse Catalog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-brand-surface-muted border border-brand-border rounded-brand p-8">
                            <ShoppingBag className="w-12 h-12 text-brand-text-muted mx-auto mb-3 opacity-40" />
                            <h3 className="text-base font-semibold text-brand-secondary mb-1">
                                Catalog Initializing
                            </h3>
                            <p className="text-xs text-brand-text-muted max-w-sm mx-auto mb-4 leading-relaxed">
                                Our store catalog is being prepared. Sign in or check back soon for our new collection.
                            </p>
                            <Link href="/products">
                                <Button size="sm" variant="outline">
                                    Browse All Products
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* New Arrivals Section (if available) */}
            {newArrivals.length > 0 && (
                <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                                New Arrivals
                            </h2>
                            <p className="text-xs text-brand-text-muted mt-1">
                                The latest additions to our store collection
                            </p>
                        </div>
                        <Link
                            href="/products?sort=newest"
                            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                        >
                            <span>See All New</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </StorefrontLayout>
    );
}
