import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Heart, ShoppingBag, ArrowRight, Trash2, ArrowLeft } from 'lucide-react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import Button from '@/Components/ui/Button';
import { addToCart } from '@/utils/cart';
import { getLocalWishlist, removeWishlistItem, saveLocalWishlist } from '@/utils/wishlist';

export default function Wishlist({ products, categories }) {
    const { auth } = usePage().props;
    const serverProducts = products?.data || [];

    const [items, setItems] = useState(() => {
        if (serverProducts.length > 0) {
            return serverProducts;
        }
        return getLocalWishlist();
    });

    useEffect(() => {
        if (serverProducts.length > 0) {
            setItems(serverProducts);
            // Sync to local storage for offline / quick reference
            saveLocalWishlist(serverProducts);
        } else {
            setItems(getLocalWishlist());
        }

        const handleSync = () => {
            if (!auth?.user || serverProducts.length === 0) {
                setItems(getLocalWishlist());
            }
        };

        window.addEventListener('aura-wishlist-updated', handleSync);
        return () => window.removeEventListener('aura-wishlist-updated', handleSync);
    }, [serverProducts, auth?.user]);

    const handleAddToCart = (product) => {
        const result = addToCart({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: parseFloat(product.sale_price || product.base_price || product.price || 0),
            image: product.images?.[0]?.image_path || product.primary_image?.image_path || '/placeholder-product.svg',
            quantity: 1,
            deliveryFee: parseFloat(product.delivery_fee || 0),
            codAvailable: Boolean(product.cod_available),
            returnable: Boolean(product.returnable || product.has_return_exchange),
        });

        if (result.success) {
            alert(`"${product.name}" added to your cart!`);
        } else {
            alert(result.message);
        }
    };

    const handleRemove = async (productId) => {
        await removeWishlistItem(productId, auth?.user);
        setItems((prev) => prev.filter((item) => String(item.id) !== String(productId)));
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
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-6">
                        {items.map((product) => {
                            const image = product.images?.[0]?.image_path || product.primary_image?.image_path || '/placeholder-product.svg';
                            const price = parseFloat(product.sale_price || product.base_price || product.price || 0);

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
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-500 hover:bg-rose-50 shadow-xs transition-colors"
                                            title="Remove from Wishlist"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/products/${product.slug}`}
                                                className="text-xs font-semibold text-slate-900 line-clamp-2 hover:text-brand-primary transition-colors"
                                            >
                                                {product.name}
                                            </Link>
                                            <div className="mt-1.5 flex items-baseline gap-2">
                                                <span className="font-extrabold text-sm sm:text-base text-slate-900 font-mono">
                                                    ₹{price.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => handleAddToCart(product)}
                                            className="w-full mt-3 sm:mt-4 bg-brand-primary hover:bg-brand-primary/90 text-white text-[11px] sm:text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 shadow-xs"
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
