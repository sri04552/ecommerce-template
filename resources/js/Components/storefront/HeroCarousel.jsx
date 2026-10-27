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
    ShieldCheck,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';
import Button from '../ui/Button';

const SLIDES = [
    {
        id: 'slide-1',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-1.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-1.jpg',
        alt: 'Smiling woman with sunglasses holding shopping bags and card',
        personSide: 'right', // Content on LEFT
        bgGradient: 'from-white via-[#FFF1F6] to-[#FCE4EC]',
        accentAura: 'rgba(194, 24, 91, 0.12)',
        badge: {
            icon: Sparkles,
            text: 'SIGNATURE COLLECTION 2026',
        },
        titlePrimary: 'Shop Smart.',
        titleAccent: 'Spend Better.',
        subtitle: 'Curated premium fashion, electronics, and lifestyle essentials engineered for longevity, transparent pricing, and effortless everyday living.',
        primaryCta: {
            text: 'Explore New Arrivals',
            url: '/products',
        },
        secondaryCta: {
            text: 'View Featured Deals',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Truck, text: 'Express Pan-India Delivery' },
            { icon: CreditCard, text: 'Instant UPI, Cards & COD' },
        ],
    },
    {
        id: 'slide-2',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-2.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-2.jpg',
        alt: 'Modern guy holding shopping bag over shoulder with deals',
        personSide: 'left', // Content on RIGHT
        bgGradient: 'from-[#FFF1F6] via-white to-[#FCE4EC]',
        accentAura: 'rgba(136, 14, 79, 0.10)',
        badge: {
            icon: Flame,
            text: 'CURATED PROMOTIONAL OFFERS',
        },
        titlePrimary: 'Refined Quality.',
        titleAccent: 'Direct Value.',
        subtitle: 'Discover handpicked collections crafted with strict durability standards, authentic origin, and zero middleman markups.',
        primaryCta: {
            text: 'Discover Collection',
            url: '/products',
        },
        secondaryCta: {
            text: 'Explore Trending',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Percent, text: 'Direct Manufacturer Value' },
            { icon: Clock, text: 'Real-Time Inventory' },
        ],
    },
    {
        id: 'slide-3',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-3.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-3.jpg',
        alt: 'Dreamy woman smiling and holding colorful shopping bags',
        personSide: 'left', // Content on RIGHT
        bgGradient: 'from-[#FCE4EC] via-white to-[#FFF1F6]',
        accentAura: 'rgba(233, 30, 99, 0.12)',
        badge: {
            icon: ShoppingBag,
            text: 'VERIFIED CATALOG ESSENTIALS',
        },
        titlePrimary: 'Turn Everyday Living',
        titleAccent: 'Into Luxury.',
        subtitle: 'From modern apparel to home accessories, elevate your daily lifestyle with verified authenticity and seamless pan-India fulfillment.',
        primaryCta: {
            text: 'Browse Product Catalog',
            url: '/products',
        },
        secondaryCta: {
            text: 'Track Existing Order',
            url: '/track',
        },
        highlights: [
            { icon: CheckCircle2, text: '100% Inspected & Authentic' },
            { icon: RotateCcw, text: '3-Day Doorstep Returns' },
        ],
    },
    {
        id: 'slide-4',
        imageWebp: '/assets/images/hero/home-page-hero-section-carousel-image-4.webp',
        imageJpg: '/assets/images/hero/home-page-hero-section-carousel-image-4.jpg',
        alt: 'Smiling guy demonstrating gift and shopping bag',
        personSide: 'left', // Content on RIGHT
        bgGradient: 'from-white via-[#FFF1F6] to-[#FCE4EC]',
        accentAura: 'rgba(194, 24, 91, 0.10)',
        badge: {
            icon: Gift,
            text: 'SPECIAL FINDS & PREMIUM PACKAGING',
        },
        titlePrimary: 'Delivering Joy',
        titleAccent: 'To Every Door.',
        subtitle: 'Express courier dispatch via Delhivery & BlueDart with real-time live SMS tracking and tamper-evident retail presentation.',
        primaryCta: {
            text: 'Shop Curated Catalog',
            url: '/products',
        },
        secondaryCta: {
            text: 'Browse Best Sellers',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Truck, text: 'Delhivery & BlueDart Logistics' },
            { icon: ShieldCheck, text: 'GST Tax Invoiced & Insured' },
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

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    };

    return (
        <section
            aria-label="Promotional Hero Showcase"
            className="relative w-full overflow-hidden select-none bg-brand-surface transition-colors duration-700 min-h-[520px] md:min-h-[600px] lg:min-h-[calc(100vh-80px)]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Ambient SVG Geometric Accents */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
                <svg
                    className="absolute top-12 left-10 w-96 h-96 text-brand-primary/10 animate-pulse duration-1000"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
                    <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="0.75" />
                    <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                </svg>

                <svg
                    className="absolute -bottom-16 right-16 w-80 h-80 text-brand-accent/10"
                    viewBox="0 0 300 300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M150 0L190 110L300 150L190 190L150 300L110 190L0 150L110 110L150 0Z"
                        fill="currentColor"
                        opacity="0.25"
                    />
                </svg>
            </div>

            {/* Slides Track */}
            {SLIDES.map((slide, index) => {
                const isActive = index === current;
                const BadgeIcon = slide.badge.icon;
                const isContentLeft = slide.personSide === 'right';

                return (
                    <div
                        key={slide.id}
                        aria-hidden={!isActive}
                        className={`absolute inset-0 w-full h-full bg-gradient-to-br ${slide.bgGradient} transition-opacity duration-700 ease-in-out ${
                            isActive
                                ? 'opacity-100 z-10 pointer-events-auto'
                                : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                        {/* Subtle Radial Glow Aura */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-60"
                            style={{
                                background: `radial-gradient(circle at ${isContentLeft ? '75% 40%' : '25% 40%'}, ${slide.accentAura} 0%, transparent 65%)`,
                            }}
                        />

                        {/* ========================================================
                            DESKTOP LAYOUT (lg: 1024px and up)
                            Full-height editorial showcase
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
                                        className={`w-full max-w-xl lg:max-w-2xl text-left transition-all duration-700 delay-100 transform ${
                                            isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                                        }`}
                                    >
                                        {/* Editorial Eyebrow Badge */}
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-5 shadow-xs backdrop-blur-md bg-white/95 border border-slate-200 text-slate-800">
                                            <BadgeIcon className="w-3.5 h-3.5 text-slate-700" />
                                            <span>{slide.badge.text}</span>
                                        </div>

                                        {/* Headline */}
                                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-5">
                                            <span>{slide.titlePrimary} </span>
                                            <span>{slide.titleAccent}</span>
                                        </h1>

                                        {/* Supporting Copy */}
                                        <p className="text-base lg:text-lg text-slate-700 font-normal leading-relaxed mb-8 max-w-xl">
                                            {slide.subtitle}
                                        </p>

                                        {/* CTA Buttons */}
                                        <div className="flex items-center gap-4 mb-8">
                                            <Link href={slide.primaryCta.url}>
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="gap-2 text-sm sm:text-base font-semibold px-8 py-4 shadow-md shadow-brand-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-transform bg-brand-primary hover:bg-brand-primary-hover text-white rounded-brand"
                                                >
                                                    <span>{slide.primaryCta.text}</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>

                                            <Link href={slide.secondaryCta.url}>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="text-sm sm:text-base font-semibold px-7 py-4 bg-white/95 hover:bg-white text-slate-800 border border-slate-200 shadow-xs hover:border-slate-400 backdrop-blur-sm rounded-brand"
                                                >
                                                    {slide.secondaryCta.text}
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Verified Operational Highlights */}
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-800">
                                            {slide.highlights.map((item, i) => {
                                                const ItemIcon = item.icon;
                                                return (
                                                    <div key={i} className="inline-flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                                                            <ItemIcon className="w-3.5 h-3.5" />
                                                        </div>
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
                           ======================================================== */}
                        <div className="hidden md:block lg:hidden absolute inset-0 w-full h-full">
                            <div className="max-w-5xl mx-auto h-full px-6 py-8 flex items-center">
                                <div className="grid grid-cols-2 gap-8 items-center w-full">
                                    {isContentLeft ? (
                                        <div className="text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md bg-white/95 border border-slate-200 text-slate-800 shadow-2xs">
                                                <BadgeIcon className="w-3.5 h-3.5 text-slate-700" />
                                                <span>{slide.badge.text}</span>
                                            </div>

                                            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                                                <span>{slide.titlePrimary} </span>
                                                <span>{slide.titleAccent}</span>
                                            </h1>

                                            <p className="text-sm text-slate-700 font-normal leading-relaxed">
                                                {slide.subtitle}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                <Link href={slide.primaryCta.url}>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="gap-2 text-xs font-semibold px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/25 rounded-brand"
                                                    >
                                                        <span>{slide.primaryCta.text}</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Link href={slide.secondaryCta.url}>
                                                    <Button
                                                        variant="outline"
                                                        size="md"
                                                        className="text-xs font-semibold px-4 py-2.5 bg-white/95 hover:bg-white text-slate-800 border border-slate-200 hover:border-slate-400 rounded-brand"
                                                    >
                                                        {slide.secondaryCta.text}
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-slate-800">
                                                {slide.highlights.map((item, i) => {
                                                    const ItemIcon = item.icon;
                                                    return (
                                                        <div key={i} className="inline-flex items-center gap-2">
                                                            <ItemIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-[460px] w-full flex items-center justify-center overflow-hidden rounded-brand bg-slate-50 border border-slate-200 shadow-xs">
                                            <picture className="w-full h-full block">
                                                <source srcSet={slide.imageWebp} type="image/webp" />
                                                <img
                                                    src={slide.imageJpg}
                                                    alt={slide.alt}
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
                                                />
                                            </picture>
                                        </div>
                                    )}

                                    {!isContentLeft ? (
                                        <div className="text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase backdrop-blur-md bg-white/95 border border-slate-200 text-slate-800 shadow-2xs">
                                                <BadgeIcon className="w-3.5 h-3.5 text-slate-700" />
                                                <span>{slide.badge.text}</span>
                                            </div>

                                            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                                                <span>{slide.titlePrimary} </span>
                                                <span>{slide.titleAccent}</span>
                                            </h1>

                                            <p className="text-sm text-slate-700 font-normal leading-relaxed">
                                                {slide.subtitle}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                                <Link href={slide.primaryCta.url}>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="gap-2 text-xs font-semibold px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/25 rounded-brand"
                                                    >
                                                        <span>{slide.primaryCta.text}</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Link href={slide.secondaryCta.url}>
                                                    <Button
                                                        variant="outline"
                                                        size="md"
                                                        className="text-xs font-semibold px-4 py-2.5 bg-white/95 hover:bg-white text-slate-800 border border-slate-200 hover:border-slate-400 rounded-brand"
                                                    >
                                                        {slide.secondaryCta.text}
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-slate-800">
                                                {slide.highlights.map((item, i) => {
                                                    const ItemIcon = item.icon;
                                                    return (
                                                        <div key={i} className="inline-flex items-center gap-2">
                                                            <ItemIcon className="w-4 h-4 text-slate-700 shrink-0" />
                                                            <span>{item.text}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-[460px] w-full flex items-center justify-center overflow-hidden rounded-brand bg-slate-50 border border-slate-200 shadow-xs">
                                            <picture className="w-full h-full block">
                                                <source srcSet={slide.imageWebp} type="image/webp" />
                                                <img
                                                    src={slide.imageJpg}
                                                    alt={slide.alt}
                                                    loading={index === 0 ? 'eager' : 'lazy'}
                                                    decoding="async"
                                                    className="w-full h-full object-cover"
                                                />
                                            </picture>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ========================================================
                            MOBILE LAYOUT (Below 768px)
                           ======================================================== */}
                        <div className="block md:hidden absolute inset-0 w-full h-full flex flex-col justify-between pt-3 pb-14 px-4 select-none">
                            {/* Photo Area */}
                            <div className="w-full h-52 sm:h-60 relative rounded-brand overflow-hidden shadow-xs shrink-0 border border-brand-border">
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

                            {/* Text & CTAs */}
                            <div className="w-full flex-1 flex flex-col justify-center text-center items-center px-1 pt-3 pb-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/95 border border-slate-200 text-slate-800 mb-2 shadow-2xs">
                                    <BadgeIcon className="w-3 h-3 text-slate-700" />
                                    <span>{slide.badge.text}</span>
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight mb-2">
                                    <span>{slide.titlePrimary} </span>
                                    <span>{slide.titleAccent}</span>
                                </h1>

                                <p className="text-xs text-slate-700 font-normal leading-relaxed max-w-sm mb-4 line-clamp-2">
                                    {slide.subtitle}
                                </p>

                                <div className="flex items-center justify-center gap-2.5 mb-3.5 w-full max-w-xs">
                                    <Link href={slide.primaryCta.url} className="flex-1">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="w-full justify-center gap-1.5 text-xs font-semibold py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm shadow-brand-primary/25 rounded-brand"
                                        >
                                            <span>{slide.primaryCta.text}</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </Link>

                                    <Link href={slide.secondaryCta.url} className="flex-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center text-xs font-semibold py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-400 shadow-2xs rounded-brand"
                                        >
                                            {slide.secondaryCta.text}
                                        </Button>
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-800">
                                    {slide.highlights.map((item, i) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div key={i} className="inline-flex items-center gap-1.5">
                                                <ItemIcon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
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
                className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-md backdrop-blur-sm items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>

            <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-md backdrop-blur-sm items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
                <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>

            {/* Mobile Navigation Chevrons */}
            <div className="md:hidden absolute top-28 -translate-y-1/2 left-2 right-2 z-30 flex justify-between pointer-events-none">
                <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-transform active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-sm flex items-center justify-center transition-transform active:scale-95"
                >
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
            </div>

            {/* Bottom Pagination Dots */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md">
                {SLIDES.map((slide, index) => {
                    const isActive = index === current;
                    return (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setCurrent(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 cursor-pointer ${
                                isActive
                                    ? 'w-7 h-2.5 bg-brand-primary shadow-xs shadow-brand-primary/30'
                                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                        />
                    );
                })}
            </div>
        </section>
    );
}
