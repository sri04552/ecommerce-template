import { Head } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeroCarousel from '../Components/storefront/HeroCarousel';

export default function Welcome({
    categories = [],
    storeName = 'Ecommerce Store',
}) {
    return (
        <StorefrontLayout categories={categories}>
            <Head title={`${storeName} — Signature Modern Lifestyle Essentials`} />

            {/* Section 1: Flagship Hero Showcase */}
            <HeroCarousel />
        </StorefrontLayout>
    );
}
