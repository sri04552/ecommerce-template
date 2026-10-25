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
        imageWebp: '/assets/images/hero/beautiful-asian-woman-sunglasses-going-shopping-holding-bags-showing-credit-card-standing-ove.webp',
        imageJpg: '/assets/images/hero/beautiful-asian-woman-sunglasses-going-shopping-holding-bags-showing-credit-card-standing-ove.jpg',
        alt: 'Smiling woman with sunglasses holding shopping bags and credit card',
        personSide: 'right', // Person is on the right -> Content on the LEFT
        bgColor: '#ff91a2',
        badge: {
            icon: Sparkles,
            text: 'NEW SEASON COLLECTION',
            style: 'bg-rose-900/10 text-rose-950 border-rose-900/20',
        },
        title: 'Shop Smart. Spend Better.',
        subtitle: 'Unlock exclusive member rewards, instant checkout perks, and up to 40% off curated fashion and lifestyle trends.',
        primaryCta: {
            text: 'Shop New Arrivals',
            url: '/products',
        },
        secondaryCta: {
            text: 'Explore Catalog',
            url: '/products?featured=1',
        },
        highlights: [
            { icon: Truck, text: 'Free Shipping Over $75' },
            { icon: CreditCard, text: 'Member Cashback Rewards' },
        ],
    },
    {
        id: 'slide-2',
        imageWebp: '/assets/images/hero/image-modern-guy-holding-shopping-bag-shoulder-turn-shushing-camera-telling-se.webp',
        imageJpg: '/assets/images/hero/image-modern-guy-holding-shopping-bag-shoulder-turn-shushing-camera-telling-se.jpg',
        alt: 'Modern guy holding shopping bag over shoulder shushing camera with secret deals',
        personSide: 'left', // Person is on the left -> Content on the RIGHT
        bgColor: '#86c8e0',
        badge: {
            icon: Flame,
            text: 'INSIDER FLASH OFFERS',
            style: 'bg-sky-900/10 text-sky-950 border-sky-900/20',
        },
        title: "Don't Miss The Best Kept Deals.",
        subtitle: 'Secret discounts on premium tech accessories, streetwear, and lifestyle must-haves before they sell out.',
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
            { icon: Clock, text: 'Daily Limited Quantities' },
        ],
    },
    {
        id: 'slide-3',
        imageWebp: '/assets/images/hero/young-dreamy-woman-thinking-buying-new-things-holding-shopping-bags-smiling-standing-against.webp',
        imageJpg: '/assets/images/hero/young-dreamy-woman-thinking-buying-new-things-holding-shopping-bags-smiling-standing-against.jpg',
        alt: 'Dreamy woman smiling and holding colorful shopping bags',
        personSide: 'left', // Person is on the left -> Content on the RIGHT
        bgColor: '#95e2ea',
        badge: {
            icon: ShoppingBag,
            text: 'WISHLIST FAVORITES',
            style: 'bg-teal-900/10 text-teal-950 border-teal-900/20',
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
            { icon: Star, text: '4.9/5 Customer Rating' },
            { icon: RotateCcw, text: '30-Day Easy Returns' },
        ],
    },
    {
        id: 'slide-4',
        imageWebp: '/assets/images/hero/young-smiling-guy-showing-orange-shopping-bag-demonstrating-gift-standing-blue-background.webp',
        imageJpg: '/assets/images/hero/young-smiling-guy-showing-orange-shopping-bag-demonstrating-gift-standing-blue-background.jpg',
        alt: 'Smiling guy demonstrating gift and orange shopping bag',
        personSide: 'left', // Person is on the left -> Content on the RIGHT
        bgColor: '#87c7e0',
        badge: {
            icon: Gift,
            text: 'SPECIAL FINDS & GIFTS',
            style: 'bg-sky-900/10 text-sky-950 border-sky-900/20',
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
            { icon: Truck, text: 'Express Nationwide Delivery' },
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
            className="relative w-full overflow-hidden select-none bg-slate-900 transition-colors duration-700 min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:h-[100dvh]"
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

                // When person is on right, content is on left (justify-start)
                // When person is on left, content is on right (justify-end)
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
                        {/* Background Image: Person pinned to their respective side */}
                        <picture className="absolute inset-0 w-full h-full block">
                            <source srcSet={slide.imageWebp} type="image/webp" />
                            <img
                                src={slide.imageJpg}
                                alt={slide.alt}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                className={`w-full h-full object-cover select-none ${
                                    isContentLeft
                                        ? 'object-right sm:object-right'
                                        : 'object-left sm:object-left'
                                }`}
                            />
                        </picture>

                        {/* Soft directional vignette on mobile for optimal text contrast */}
                        <div
                            className={`absolute inset-0 pointer-events-none lg:hidden ${
                                isContentLeft
                                    ? 'bg-gradient-to-t from-white/95 via-white/80 to-transparent'
                                    : 'bg-gradient-to-t from-white/95 via-white/80 to-transparent'
                            }`}
                        />

                        {/* Content Container: Centered vertically; horizontally positioned opposite the person */}
                        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-12 flex items-center">
                            <div
                                className={`w-full flex ${
                                    isContentLeft ? 'justify-start' : 'justify-end'
                                }`}
                            >
                                <div
                                    className={`w-full max-w-xl lg:max-w-2xl text-left transition-all duration-700 delay-150 transform ${
                                        isActive
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-6 opacity-0'
                                    } bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl border border-white/60 lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:shadow-none lg:border-none`}
                                >
                                    {/* Category / Campaign Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border mb-4 shadow-2xs backdrop-blur-sm bg-white/80 border-slate-900/10 text-slate-900">
                                        <BadgeIcon className="w-3.5 h-3.5 text-slate-900" />
                                        <span>{slide.badge.text}</span>
                                    </div>

                                    {/* Headline */}
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.08] mb-4">
                                        {slide.title}
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="text-sm sm:text-base lg:text-lg text-slate-800 font-medium leading-relaxed mb-6 max-w-xl">
                                        {slide.subtitle}
                                    </p>

                                    {/* Call-to-Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-3.5 mb-6">
                                        <Link href={slide.primaryCta.url}>
                                            <Button
                                                variant="secondary"
                                                size="lg"
                                                className="gap-2 text-sm sm:text-base font-semibold px-6 py-3 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform bg-slate-950 hover:bg-slate-800 text-white"
                                            >
                                                <span>{slide.primaryCta.text}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>

                                        <Link href={slide.secondaryCta.url}>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="text-sm sm:text-base font-semibold px-6 py-3 bg-white/80 hover:bg-white text-slate-900 border-slate-300 shadow-2xs backdrop-blur-sm"
                                            >
                                                {slide.secondaryCta.text}
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Value / Trust Highlights without divider line */}
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1 text-xs sm:text-sm font-semibold text-slate-900">
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
                );
            })}

            {/* Previous Navigation Button */}
            <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Navigation Button */}
            <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Bottom Pagination Dots */}
            <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/30 backdrop-blur-md border border-white/20 shadow-md">
                {SLIDES.map((slide, index) => {
                    const isActive = index === current;
                    return (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setCurrent(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                isActive
                                    ? 'w-8 bg-white shadow-xs'
                                    : 'w-2.5 bg-white/50 hover:bg-white/80'
                            }`}
                        />
                    );
                })}
            </div>
        </section>
    );
}
