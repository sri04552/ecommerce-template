import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/catalog/ProductCard';
import Button from '../../Components/ui/Button';
import { Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';

export default function Index({ products, categories = [], selectedCategory = null, filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/products', {
            ...filters,
            search: searchTerm,
            page: 1,
        });
    };

    const handleSortChange = (e) => {
        router.get('/products', {
            ...filters,
            sort: e.target.value,
            page: 1,
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/products');
    };

    return (
        <StorefrontLayout categories={categories}>
            <Head title={filters.search ? `Search: "${filters.search}" — Catalog` : 'All Products — Catalog'} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Header & Breadcrumb */}
                <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-brand-border gap-4">
                    <div>
                        <div className="text-xs text-brand-text-muted mb-1 flex items-center gap-1.5">
                            <Link href="/" className="hover:text-brand-text">Home</Link>
                            <span>/</span>
                            <span className="font-semibold text-brand-secondary">
                                {selectedCategory ? selectedCategory.name : 'All Products'}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-secondary">
                            {selectedCategory ? selectedCategory.name : 'Product Catalog'}
                        </h1>
                        <p className="text-xs text-brand-text-muted mt-1">
                            Showing {products.total} {products.total === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    {/* Sorting & Search Controls */}
                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search in catalog..."
                                className="pl-9 pr-4 py-1.5 text-xs bg-brand-surface border border-brand-border rounded-brand text-brand-text placeholder-brand-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary w-48 sm:w-60"
                            />
                        </form>

                        <div className="flex items-center gap-1.5">
                            <SlidersHorizontal className="w-4 h-4 text-brand-text-muted hidden sm:inline" />
                            <select
                                value={filters.sort || ''}
                                onChange={handleSortChange}
                                className="px-3 py-1.5 text-xs bg-brand-surface border border-brand-border rounded-brand text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="">Sort: Newest</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="name_asc">Name: A to Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Active Filter Pills */}
                {(filters.search || filters.category || filters.featured) && (
                    <div className="flex flex-wrap items-center gap-2 pt-4">
                        <span className="text-xs font-semibold text-brand-text-muted">Active Filters:</span>
                        {filters.search && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-brand-surface border border-brand-border text-brand-text">
                                Search: "{filters.search}"
                            </span>
                        )}
                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-brand-surface border border-brand-border text-brand-text">
                                Category: {selectedCategory.name}
                            </span>
                        )}
                        {filters.featured && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-brand-surface border border-brand-border text-brand-text">
                                Featured Only
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline ml-2"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Reset All</span>
                        </button>
                    </div>
                )}

                {/* Main Content: Categories Sidebar & Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
                    {/* Category Filter Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="bg-brand-surface border border-brand-border rounded-brand p-5">
                            <h3 className="font-semibold text-xs uppercase tracking-wider text-brand-secondary mb-3">
                                Categories
                            </h3>
                            <nav className="space-y-1 text-xs">
                                <Link
                                    href="/products"
                                    className={`block px-3 py-2 rounded-brand font-medium transition-colors ${
                                        !filters.category
                                            ? 'bg-brand-primary text-white'
                                            : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-muted'
                                    }`}
                                >
                                    All Categories
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/products?category=${cat.id}`}
                                        className={`flex items-center justify-between px-3 py-2 rounded-brand font-medium transition-colors ${
                                            Number(filters.category) === cat.id
                                                ? 'bg-brand-primary text-white'
                                                : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-muted'
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                        {cat.products_count !== undefined && (
                                            <span className="text-[10px] opacity-75">{cat.products_count}</span>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        {products.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-brand p-8">
                                <ShoppingBag className="w-12 h-12 text-brand-text-muted mx-auto mb-3 opacity-40" />
                                <h3 className="text-base font-semibold text-brand-secondary mb-1">
                                    No products found
                                </h3>
                                <p className="text-xs text-brand-text-muted max-w-sm mx-auto mb-4 leading-relaxed">
                                    We couldn't find any products matching your search criteria. Try removing filters or searching for another term.
                                </p>
                                <Button size="sm" variant="outline" onClick={handleClearFilters}>
                                    Reset Filters
                                </Button>
                            </div>
                        )}

                        {/* Pagination Links */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 pt-6 border-t border-brand-border">
                                {products.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1.5 text-xs rounded-brand border font-medium transition-colors ${
                                            link.active
                                                ? 'bg-brand-primary text-white border-brand-primary'
                                                : link.url
                                                ? 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-muted'
                                                : 'bg-brand-surface-muted border-brand-border text-brand-text-muted opacity-50 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
