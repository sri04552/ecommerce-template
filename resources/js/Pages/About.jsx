import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import Button from '../Components/ui/Button';
import {
    ShieldCheck,
    Truck,
    RotateCcw,
    CreditCard,
    Award,
    HeartHandshake,
    Sparkles,
    CheckCircle2,
    Users,
    MapPin,
    ArrowRight,
    Headphones,
    Star,
    Layers,
    ChevronRight,
} from 'lucide-react';

export default function About({ storeName = 'Aura Store', categories = [] }) {
    const stats = [
        { label: 'Happy Customers Across India', value: '50,000+', icon: Users },
        { label: 'States & UTs Covered', value: '28+', icon: MapPin },
        { label: 'Verified 5-Star Ratings', value: '4.9 / 5', icon: Star },
        { label: 'Hassle-Free Returns Window', value: '3 Days', icon: RotateCcw },
    ];

    const values = [
        {
            icon: ShieldCheck,
            title: '100% Genuine Authenticity',
            description:
                'Every product is directly sourced from certified manufacturers and artisan workshops. Zero grey-market stock, zero compromises.',
            badge: 'Quality First',
        },
        {
            icon: RotateCcw,
            title: '3-Day Instant UPI Returns',
            description:
                'Not satisfied? Hand it back to our courier within 3 days and get direct UPI or bank account refunds credited right after verification.',
            badge: 'Risk Free',
        },
        {
            icon: Truck,
            title: 'Express Pan-India Dispatch',
            description:
                'We partner with premier courier networks (Shiprocket, Delhivery, BlueDart) to bring fast, tracked, and insured delivery to your doorstep.',
            badge: 'Fast Dispatch',
        },
        {
            icon: CreditCard,
            title: 'Transparent Pricing & COD',
            description:
                'No hidden convenience charges at checkout. Enjoy transparent GST invoicing, flexible Cash on Delivery, and 256-bit secure online payments.',
            badge: 'No Hidden Fees',
        },
    ];

    const milestones = [
        {
            year: 'Step 01',
            title: 'Direct Sourcing & Curation',
            desc: 'We bypass unnecessary distributors to bring direct factory-to-doorstep savings to Indian shoppers without sacrificing material grade.',
        },
        {
            year: 'Step 02',
            title: 'Double-Layer Quality Auditing',
            desc: 'Every item passes rigorous dimensional, physical, and packaging checks at our fulfillment hubs before dispatch.',
        },
        {
            year: 'Step 03',
            title: 'Seamless Digital Commerce',
            desc: 'Built with cutting-edge serverless cloud architecture for blazing-fast mobile browsing, instant order tracking, and 1-click cart management.',
        },
    ];

    const reviews = [
        {
            name: 'Priya Sharma',
            city: 'Bengaluru, Karnataka',
            quote: '“The product quality exceeded expectations! Ordered on Wednesday evening and received it by Friday noon. Clean packaging and instant tracking updates.”',
            rating: 5,
        },
        {
            name: 'Rahul Varma',
            city: 'Hyderabad, Telangana',
            quote: '“Returning an item was super easy. Courier picked it up and my refund was credited via UPI within hours. Rare to see this level of honesty in online shopping!”',
            rating: 5,
        },
        {
            name: 'Ananya Deshmukh',
            city: 'Pune, Maharashtra',
            quote: '“Zero hidden fees! What you see is exactly what you pay at checkout. Customer support answered my sizing questions on email within 15 minutes.”',
            rating: 5,
        },
    ];

    return (
        <StorefrontLayout categories={categories}>
            <Head title={`About Us — ${storeName} · Story, Values & Customer Promise`} />

            {/* Breadcrumb Navigation */}
            <div className="bg-brand-surface border-b border-brand-border/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex items-center gap-2 text-xs text-brand-text-muted">
                        <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-semibold text-brand-secondary">About Us</span>
                    </nav>
                </div>
            </div>

            {/* Hero Section */}
            <section className="bg-white border-b border-slate-200 py-14 sm:py-20 lg:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Crafted For India · Built For Everyday Living</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
                        Democratizing Premium Quality for <span className="text-blue-600">Every Indian Home</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                        We bridge the gap between high-end craftsmanship and transparent pricing. Discover carefully vetted apparel, electronics, and lifestyle trends engineered for longevity, function, and genuine joy.
                    </p>

                    <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/products" className="w-full sm:w-auto">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-lg shadow-xs transition-colors"
                            >
                                <span>Explore Catalog</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>

                        <Link href="/track" className="w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto gap-2 bg-white hover:bg-slate-50 text-slate-800 border-slate-300 font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                <Truck className="w-4 h-4 text-blue-600" />
                                <span>Track Order</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Key Metrics / Numbers Counter */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-8">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="flex flex-col items-center text-center p-2 sm:p-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 sm:mb-3 border border-blue-100">
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {stat.value}
                                </span>
                                <span className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-tight">
                                    {stat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Our Story & Heritage */}
            <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                            <Award className="w-4 h-4" />
                            <span>Our Origin & Purpose</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Say Goodbye to Counterfeits, Delayed Shipping, and Shady Refund Terms.
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {storeName} was launched with a single mission: to provide Indian shoppers with an online shopping experience they can trust without second-guessing.
                        </p>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Unlike giant marketplaces flooded with untested third-party resellers, every SKU on our platform undergoes rigorous sample inspection, real-world stress testing, and packaging audits. We stand behind every parcel that leaves our warehouse.
                        </p>

                        <div className="space-y-2.5 pt-2">
                            {[
                                'Government GST-compliant tax invoicing on every purchase',
                                'Safe packaging with tear-resistant tamper-evident seals',
                                'Fast customer response via WhatsApp, phone, and direct email',
                            ].map((point, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Feature Card Stack */}
                    <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-900">How We Operate</h3>
                                <p className="text-xs text-slate-500">From workshop floor to your doorstep</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {milestones.map((m, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                                        {m.year}
                                    </span>
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                                        {m.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        {m.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our 4 Customer Guarantees (The Pillars) */}
            <section className="bg-slate-50 border-y border-slate-200 py-14 sm:py-18">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                            Transparent Standards
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            The Four Guarantees We Promise Every Customer
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            No asterisks, no small-print loopholes. Here is what you can always rely on.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {values.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-3.5">
                                        <div className="flex items-center justify-between">
                                            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                {v.badge}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-sm text-slate-900">
                                            {v.title}
                                        </h3>

                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {v.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Customer Love & Verified Testimonials */}
            <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                        <span>Verified Buyer Stories</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Loved by Shoppers Across India
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Here is what real customers say after unboxing their orders.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((r, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-1">
                                    {[...Array(r.rating)].map((_, starIdx) => (
                                        <Star key={starIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                                    {r.quote}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-xs text-slate-900">{r.name}</h4>
                                    <p className="text-[11px] text-slate-400">{r.city}</p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Verified
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Enterprise Security & Trust Band */}
            <section className="bg-slate-900 text-slate-200 py-12 border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white">256-Bit SSL Encrypted</h4>
                                <p className="text-xs text-slate-400">Bank-grade data encryption on all checkout workflows</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center shrink-0">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white">Dedicated Support</h4>
                                <p className="text-xs text-slate-400">10 AM – 7 PM IST email & ticket resolution</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center shrink-0">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white">COD & Instant UPI</h4>
                                <p className="text-xs text-slate-400">Pay on delivery or zero-friction UPI checkout</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Banner */}
            <section className="py-14 sm:py-18 bg-blue-600 text-white text-center">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                        Ready to Upgrade Your Daily Essentials?
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
                        Join over 50,000 satisfied shoppers who trust {storeName} for authentic items, honest pricing, and prompt delivery.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/products" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-3 rounded-lg shadow-sm transition-colors"
                            >
                                <span>Browse Catalog</span>
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
