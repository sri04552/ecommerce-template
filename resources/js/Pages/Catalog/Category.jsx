import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/catalog/ProductCard';
import Button from '../../Components/ui/Button';
import { ShoppingBag, ArrowLeft, SlidersHorizontal } from 'lucide-react';

export default function Category({ category, subcategories = [], products, categories = [] }) {
    const handleSortChange = (e) => {
        router.get(`/categories/${category.slug}`, {
            sort: e.target.value,
        });
    };

    return (
        <StorefrontLayout categories={categories}>
            <Head title={`${category.name} — Category`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Category Banner / Header */}
                <div className="bg-brand-surface border border-brand-border rounded-brand p-5 sm:p-8 mb-8">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-secondary">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="mt-2 text-xs sm:text-sm text-brand-text-muted leading-relaxed">
                                {category.description}
                            </p>
                        )}
                    </div>

                    {/* Subcategories Pills */}
                    {subcategories.length > 0 && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-brand-border flex flex-wrap gap-2">
                            <span className="text-xs font-semibold text-brand-text-muted self-center mr-2">
                                Subcategories:
                            </span>
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub.id}
                                    href={`/categories/${sub.slug}`}
                                    className="px-3 py-1 bg-brand-surface-muted border border-brand-border rounded-full text-xs font-medium text-brand-text hover:border-brand-primary transition-colors"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between pb-4 sm:pb-6 mb-6 border-b border-brand-border">
                    <span className="text-xs text-brand-text-muted">
                        Showing {products.total} {products.total === 1 ? 'product' : 'products'}
                    </span>

                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-brand-text-muted" />
                        <select
                            onChange={handleSortChange}
                            defaultValue={new URLSearchParams(window.location.search).get('sort') || ''}
                            className="px-3 py-1.5 text-xs bg-brand-surface border border-brand-border rounded-brand text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        >
                            <option value="">Sort: Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {/* Product Grid */}
                {products.data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-brand p-8">
                        <ShoppingBag className="w-12 h-12 text-brand-text-muted mx-auto mb-3 opacity-40" />
                        <h3 className="text-base font-semibold text-brand-secondary mb-1">
                            No products in this category yet
                        </h3>
                        <p className="text-xs text-brand-text-muted max-w-sm mx-auto mb-4 leading-relaxed">
                            New items are added frequently. Explore other categories or browse the full catalog.
                        </p>
                        <Link href="/products">
                            <Button size="sm" variant="outline" className="gap-2">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Browse All Products</span>
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
