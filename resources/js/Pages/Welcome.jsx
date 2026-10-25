import { Head } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeroCarousel from '../Components/storefront/HeroCarousel';

export default function Welcome({
    categories = [],
    storeName = 'Aura Store',
}) {
    return (
        <StorefrontLayout categories={categories}>
            <Head title={`${storeName} — Modern Lifestyle Essentials`} />

            {/* Section 1: Hero Carousel Showcase Only */}
            <HeroCarousel />
        </StorefrontLayout>
    );
}
