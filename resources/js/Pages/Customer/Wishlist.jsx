import { Head, Link } from '@inertiajs/react';
import { Heart, ShoppingBag, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import Button from '@/Components/ui/Button';
import { addToCart } from '@/utils/cart';

export default function Wishlist({ products, categories }) {
    const items = products?.data || [];

    const handleAddToCart = (product) => {
        addToCart({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: parseFloat(product.base_price || product.price || 0),
            image: product.images?.[0]?.image_path || '/placeholder-product.svg',
            quantity: 1,
            deliveryFee: parseFloat(product.delivery_fee || 0),
            codAvailable: Boolean(product.cod_available),
            returnable: Boolean(product.returnable),
        });
        alert(`"${product.name}" added to your cart!`);
    };

    const handleRemove = async (productId) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        await fetch(`/api/wishlist/${productId}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
            },
        });
        window.location.reload();
    };

    return (
        <StorefrontLayout categories={categories}>
            <Head title="My Wishlist" />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                            <h1 className="text-2xl font-bold text-brand-secondary">My Wishlist</h1>
                        </div>
                        <p className="text-xs text-brand-text-muted mt-1">
                            Save products you love and purchase them anytime
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Continue Shopping</span>
                    </Link>
                </div>

                {/* Items Grid */}
                {items.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-brand-border shadow-xs mt-6">
                        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h2 className="text-base font-bold text-brand-secondary">Your Wishlist is Empty</h2>
                        <p className="text-xs text-brand-text-muted mt-1 max-w-sm mx-auto">
                            Explore our catalog and click the heart icon on any product to save it here for later.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors"
                        >
                            <span>Explore Products</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {items.map((product) => {
                            const image = product.images?.[0]?.image_path || '/placeholder-product.svg';
                            const price = parseFloat(product.base_price || product.price || 0);

                            return (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-xl border border-brand-border shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                                >
                                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                                        <Link href={`/products/${product.slug}`}>
                                            <img
                                                src={image}
                                                alt={product.name}
                                                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                                            />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(product.id)}
                                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-xs"
                                            title="Remove from Wishlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="text-xs font-semibold text-slate-900 line-clamp-2 hover:text-brand-primary transition-colors"
                                            >
                                                {product.name}
                                            </Link>
                                            <div className="mt-2 flex items-baseline gap-2">
                                                <span className="font-extrabold text-base text-slate-900 font-mono">
                                                    ₹{price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-full mt-4 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            <span>Move to Cart</span>
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
