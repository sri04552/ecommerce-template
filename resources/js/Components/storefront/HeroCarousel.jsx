import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Sparkles,
    Flame,
    ShoppingBag,
    Gift,
    Truck,
    CreditCard,
    Percent,
    Clock,
    Star,
    RotateCcw,
    ShieldCheck,
} from 'lucide-react';
import Button from '../ui/Button';

const SLIDES = [
    {
        id: 'slide-1',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-1.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-1.jpg',
        alt: 'Smiling woman with sunglasses holding shopping bags and credit card',
        personSide: 'right', // Person is on the right -> Content on the LEFT
        bgColor: 'var(--brand-surface-accent)',
        badge: {
            icon: Sparkles,
            text: 'NEW SEASON COLLECTION',
            style: 'bg-brand-surface-accent text-brand-primary border-brand-primary/25',
        },
        title: 'Shop Smart. Spend Better.',
        subtitle: 'Unlock exclusive member rewards, instant checkout perks, and curated lifestyle trends with guaranteed quality.',
        primaryCta: {
            text: 'Shop New Arrivals',
            url: '/products',
        },
        secondaryCta: {
            text: 'Explore Catalog',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Truck, text: 'Fast & Secure Delivery' },
            { icon: CreditCard, text: 'Instant UPI & COD' },
        ],
    },
    {
        id: 'slide-2',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-2.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-2.jpg',
        alt: 'Modern guy holding shopping bag over shoulder shushing camera with secret deals',
        personSide: 'left', // Person is on the left -> Content on the RIGHT
        bgColor: 'var(--brand-surface-muted)',
        badge: {
            icon: Flame,
            text: 'INSIDER FLASH OFFERS',
            style: 'bg-brand-surface-accent text-brand-primary border-brand-primary/25',
        },
        title: "Don't Miss The Best Kept Deals.",
        subtitle: 'Handpicked discounts on premium fashion, accessories, and daily essentials before they sell out.',
        primaryCta: {
            text: 'Claim Flash Deals',
            url: '/products',
        },
        secondaryCta: {
            text: 'View Trending',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Percent, text: 'Up to 50% Off Selected' },
            { icon: Clock, text: 'Limited Quantities' },
        ],
    },
    {
        id: 'slide-3',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-3.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-3.jpg',
        alt: 'Dreamy woman smiling and holding colorful shopping bags',
        personSide: 'left', // Person is on the left -> Content on the RIGHT
        bgColor: 'var(--brand-surface-accent)',
        badge: {
            icon: ShoppingBag,
            text: 'WISHLIST FAVORITES',
            style: 'bg-brand-surface-accent text-brand-primary border-brand-primary/25',
        },
        title: 'Turn Your Wishlist Into Reality.',
        subtitle: 'Discover handpicked styles and everyday essentials crafted with verified quality for the modern home and wardrobe.',
        primaryCta: {
            text: 'Explore Catalog',
            url: '/products',
        },
        secondaryCta: {
            text: 'Browse Categories',
            url: '/categories',
        },
        highlights: [
            { icon: Star, text: '4.9/5 Quality Rating' },
            { icon: RotateCcw, text: '3-Day Easy Returns' },
        ],
    },
    {
        id: 'slide-4',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-4.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-4.jpg',
        alt: 'Smiling guy demonstrating gift and orange shopping bag',
        personSide: 'left', // Person is on the left -> Content on the RIGHT
        bgColor: 'var(--brand-surface-muted)',
        badge: {
            icon: Gift,
            text: 'SPECIAL FINDS & GIFTS',
            style: 'bg-brand-surface-accent text-brand-primary border-brand-primary/25',
        },
        title: 'Delivering Happiness To Your Door.',
        subtitle: 'Thoughtfully curated gifts and signature essentials with premium packaging, guaranteed quality, and rapid dispatch.',
        primaryCta: {
            text: 'Shop Gift Ideas',
            url: '/products',
        },
        secondaryCta: {
            text: 'Best Sellers',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Truck, text: 'Express Delivery Across India' },
            { icon: ShieldCheck, text: '100% Quality Guaranteed' },
        ],
    },
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const slideCount = SLIDES.length;

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slideCount);
    }, [slideCount]);

    const prevSlide = useCallback(() => {
        setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
    }, [slideCount]);

    // Auto-sliding interval (3 seconds)
    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(timer);
    }, [nextSlide, isPaused]);

    // Keyboard navigation (Left/Right arrow keys)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };

    return (
        <section
            aria-label="Promotional Hero Showcase"
            className="relative w-full overflow-hidden select-none bg-slate-900 transition-colors duration-700 min-h-[520px] md:min-h-[580px] lg:h-[100dvh]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Slides Track */}
            {SLIDES.map((slide, index) => {
                const isActive = index === current;
                const BadgeIcon = slide.badge.icon;
                const isContentLeft = slide.personSide === 'right';

                return (
                    <div
                        key={slide.id}
                        aria-hidden={!isActive}
                        style={{ backgroundColor: slide.bgColor }}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                            isActive
                                ? 'opacity-100 z-10 pointer-events-auto'
                                : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                        {/* ========================================================
                            DESKTOP LAYOUT (lg: 1024px and up)
                            Full-bleed 100dvh with person pinned & text floating
                           ======================================================== */}
                        <div className="hidden lg:block absolute inset-0 w-full h-full">
                            <picture className="absolute inset-0 w-full h-full block">
                                <source srcSet={slide.imageWebp} type="image/webp" />
                                <img
                                    src={slide.imageJpg}
                                    alt={slide.alt}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    className={`w-full h-full object-cover select-none ${
                                        isContentLeft ? 'object-right' : 'object-left'
                                    }`}
                                />
                            </picture>

                            <div className="relative z-20 max-w-7xl mx-auto h-full px-8 lg:px-12 flex items-center">
                                <div className={`w-full flex ${isContentLeft ? 'justify-start' : 'justify-end'}`}>
                                    <div
                                        className={`w-full max-w-xl lg:max-w-2xl text-left transition-all duration-700 delay-150 transform ${
                                            isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                                        }`}
                                    >
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border mb-4 shadow-2xs backdrop-blur-sm bg-white/80 border-slate-900/10 text-slate-900">
                                            <BadgeIcon className="w-3.5 h-3.5 text-slate-900" />
                                            <span>{slide.badge.text}</span>
                                        </div>

                                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.08] mb-4">
                                            {slide.title}
                                        </h1>

                                        <p className="text-base lg:text-lg text-slate-800 font-medium leading-relaxed mb-6 max-w-xl">
                                            {slide.subtitle}
                                        </p>

                                        <div className="flex items-center gap-3.5 mb-6">
                                            <Link href={slide.primaryCta.url}>
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="gap-2 text-sm sm:text-base font-semibold px-7 py-3.5 shadow-md shadow-brand-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-transform bg-brand-primary hover:bg-brand-primary-hover text-white"
                                                >
                                                    <span>{slide.primaryCta.text}</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>

                                            <Link href={slide.secondaryCta.url}>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="text-sm sm:text-base font-semibold px-6 py-3.5 bg-white/90 hover:bg-white text-brand-text border-brand-border shadow-2xs hover:border-brand-primary/40 backdrop-blur-sm"
                                                >
                                                    {slide.secondaryCta.text}
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm font-semibold text-slate-900">
                                            {slide.highlights.map((item, i) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <div key={i} className="inline-flex items-center gap-2">
                                                        <ItemIcon className="w-4 h-4 text-slate-950 shrink-0" />
                                                        <span>{item.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ========================================================
                            TABLET LAYOUT (md: 768px - 1023px)
                            Side-by-side 2-column balanced split (zero overlap)
                           ======================================================== */}
                        <div className="hidden md:block lg:hidden absolute inset-0 w-full h-full">
                            <div className="max-w-5xl mx-auto h-full px-6 py-8 flex items-center">
                                <div className="grid grid-cols-2 gap-6 items-center w-full">
                                    {/* Left Column */}
                                    {isContentLeft ? (
                                        /* Content on Left */
                                        <div className="text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border bg-white/80 border-slate-900/10 text-slate-900 shadow-2xs">
                                                <BadgeIcon className="w-3.5 h-3.5 text-slate-900" />
                                                <span>{slide.badge.text}</span>
                                            </div>

                                            <h1 className="text-3xl font-black tracking-tight text-slate-950 leading-tight">
                                                {slide.title}
                                            </h1>

                                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                                {slide.subtitle}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                <Link href={slide.primaryCta.url}>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="gap-2 text-xs font-semibold px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/25"
                                                    >
                                                        <span>{slide.primaryCta.text}</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Link href={slide.secondaryCta.url}>
                                                    <Button
                                                        variant="outline"
                                                        size="md"
                                                        className="text-xs font-semibold px-4 py-2.5 bg-white/90 hover:bg-white text-brand-text border-brand-border hover:border-brand-primary/40"
                                                    >
                                                        {slide.secondaryCta.text}
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-slate-900">
                                                {slide.highlights.map((item, i) => {
                                                    const ItemIcon = item.icon;
                                                    return (
                                                        <div key={i} className="inline-flex items-center gap-2">
                                                            <ItemIcon className="w-4 h-4 text-slate-950 shrink-0" />
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Person Photo on Left */
                                        <div className="h-[460px] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/5">
                                            <picture className="w-full h-full block">
                                                <source srcSet={slide.imageWebp} type="image/webp" />
                                                <img
                                                    src={slide.imageJpg}
                                                    alt={slide.alt}
                                                    className="w-full h-full object-cover object-left select-none"
                                                />
                                            </picture>
                                        </div>
                                    )}

                                    {/* Right Column */}
                                    {isContentLeft ? (
                                        /* Person Photo on Right */
                                        <div className="h-[460px] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/5">
                                            <picture className="w-full h-full block">
                                                <source srcSet={slide.imageWebp} type="image/webp" />
                                                <img
                                                    src={slide.imageJpg}
                                                    alt={slide.alt}
                                                    className="w-full h-full object-cover object-right select-none"
                                                />
                                            </picture>
                                        </div>
                                    ) : (
                                        /* Content on Right */
                                        <div className="text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border bg-white/80 border-slate-900/10 text-slate-900 shadow-2xs">
                                                <BadgeIcon className="w-3.5 h-3.5 text-slate-900" />
                                                <span>{slide.badge.text}</span>
                                            </div>

                                            <h1 className="text-3xl font-black tracking-tight text-slate-950 leading-tight">
                                                {slide.title}
                                            </h1>

                                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                                {slide.subtitle}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                <Link href={slide.primaryCta.url}>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="gap-2 text-xs font-semibold px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/25"
                                                    >
                                                        <span>{slide.primaryCta.text}</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Link href={slide.secondaryCta.url}>
                                                    <Button
                                                        variant="outline"
                                                        size="md"
                                                        className="text-xs font-semibold px-4 py-2.5 bg-white/90 hover:bg-white text-brand-text border-brand-border hover:border-brand-primary/40"
                                                    >
                                                        {slide.secondaryCta.text}
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-slate-900">
                                                {slide.highlights.map((item, i) => {
                                                    const ItemIcon = item.icon;
                                                    return (
                                                        <div key={i} className="inline-flex items-center gap-2">
                                                            <ItemIcon className="w-4 h-4 text-slate-950 shrink-0" />
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ========================================================
                            MOBILE LAYOUT (< 768px)
                            Vertical Stack: Clean photo top, clear text bottom
                           ======================================================== */}
                        <div className="block md:hidden absolute inset-0 w-full h-full flex flex-col justify-between pt-3 pb-12 px-4 select-none">
                            {/* Top Half: Person photo cleanly framed without text obstruction */}
                            <div className="w-full h-48 sm:h-56 relative rounded-xl overflow-hidden shadow-sm shrink-0 bg-black/5">
                                <picture className="w-full h-full block">
                                    <source srcSet={slide.imageWebp} type="image/webp" />
                                    <img
                                        src={slide.imageJpg}
                                        alt={slide.alt}
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        decoding="async"
                                        className={`w-full h-full object-cover select-none ${
                                            isContentLeft ? 'object-right' : 'object-left'
                                        }`}
                                    />
                                </picture>
                            </div>

                            {/* Bottom Half: High-contrast typography & CTAs */}
                            <div className="w-full flex-1 flex flex-col justify-center text-center items-center px-1 pt-3 pb-2">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border bg-white/85 border-slate-900/10 text-slate-900 mb-2 shadow-2xs">
                                    <BadgeIcon className="w-3 h-3 text-slate-900" />
                                    <span>{slide.badge.text}</span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 leading-tight mb-2">
                                    {slide.title}
                                </h1>

                                <p className="text-xs text-slate-800 font-medium leading-relaxed max-w-sm mb-3.5 line-clamp-2">
                                    {slide.subtitle}
                                </p>

                                <div className="flex items-center justify-center gap-2.5 mb-3 w-full max-w-xs">
                                    <Link href={slide.primaryCta.url} className="flex-1">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full justify-center gap-1.5 text-xs font-semibold py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm shadow-brand-primary/25"
                                        >
                                            <span>{slide.primaryCta.text}</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </Link>

                                    <Link href={slide.secondaryCta.url} className="flex-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center text-xs font-semibold py-2.5 bg-white/90 hover:bg-white text-brand-text border-brand-border hover:border-brand-primary/40 shadow-2xs"
                                        >
                                            {slide.secondaryCta.text}
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-900">
                                    {slide.highlights.map((item, i) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div key={i} className="inline-flex items-center gap-1.5">
                                                <ItemIcon className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                                                <span>{item.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Desktop & Tablet Navigation Chevrons */}
            <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-slate-900 shadow-md backdrop-blur-sm items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/85 hover:bg-white text-slate-900 shadow-md backdrop-blur-sm items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Mobile Navigation Chevrons (Positioned cleanly over photo area) */}
            <div className="md:hidden absolute top-28 -translate-y-1/2 left-2 right-2 z-30 flex justify-between pointer-events-none">
                <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-sm flex items-center justify-center transition-transform active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-sm flex items-center justify-center transition-transform active:scale-95"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Bottom Pagination Dots */}
            <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/35 backdrop-blur-md border border-white/20 shadow-sm">
                {SLIDES.map((slide, index) => {
                    const isActive = index === current;
                    return (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setCurrent(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                isActive ? 'w-6 bg-brand-primary shadow-xs' : 'w-2 bg-white/70 hover:bg-white'
                            }`}
                        />
                    );
                })}
            </div>
        </section>
    );
}
