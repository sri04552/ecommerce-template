import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Button from '../../Components/ui/Button';
import { ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartIndex({ categories = [] }) {
    return (
        <StorefrontLayout categories={categories}>
            <Head title="Shopping Cart" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Breadcrumb */}
                <div className="text-xs text-brand-text-muted mb-4 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-brand-text">Home</Link>
                    <span>/</span>
                    <span className="font-semibold text-brand-secondary">Cart</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-secondary mb-8">
                    Your Shopping Cart
                </h1>

                {/* Empty Cart State */}
                <div className="bg-brand-surface border border-brand-border rounded-brand p-12 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-brand-surface-muted flex items-center justify-center mx-auto mb-4 text-brand-text-muted">
                        <ShoppingBag className="w-8 h-8 opacity-40" />
                    </div>

                    <h2 className="text-lg font-bold text-brand-secondary mb-2">
                        Your cart is currently empty
                    </h2>

                    <p className="text-xs text-brand-text-muted max-w-sm mx-auto mb-6 leading-relaxed">
                        Explore our featured collections, choose your favorite items, and add them to your cart.
                    </p>

                    <Link href="/products">
                        <Button variant="primary" size="md" className="gap-2">
                            <span>Browse Product Catalog</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>

                    <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-center gap-2 text-[11px] text-brand-text-muted">
                        <ShieldCheck className="w-4 h-4 text-brand-primary" />
                        <span>Checkout and order placement workflows will activate upon gateway authorization.</span>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
