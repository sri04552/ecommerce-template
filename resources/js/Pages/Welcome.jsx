import { Head } from '@inertiajs/react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import { Server, Palette, ShieldCheck, Cpu, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Welcome({
    laravelVersion,
    phpVersion,
    storeName = 'Ecommerce Store',
    _themeConfig = {},
}) {
    return (
        <StorefrontLayout storeName={storeName}>
            <Head title="Agency Ecommerce Template — Phase 1 Foundation" />

            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2">
                            <Badge variant="primary">Phase 1 Complete</Badge>
                            <Badge variant="success">Foundation Verified</Badge>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-secondary">
                            Modular, High-Performance <br />
                            <span className="text-brand-primary">Ecommerce Template</span>
                        </h1>

                        <p className="text-lg text-brand-text-muted leading-relaxed">
                            Reusable architecture designed for rapid agency client deployments.
                            Fully independent instances running seamlessly on both cPanel shared
                            hosting and cloud VPS.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Button variant="primary" size="lg" className="gap-2">
                                Explore Architecture <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="lg">
                                Review Design Tokens
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Architectural Foundations Section */}
            <section id="features" className="py-12 bg-brand-surface border-y border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-brand-secondary">
                            Engineered for Agency Scale & Flexibility
                        </h2>
                        <p className="text-sm text-brand-text-muted mt-2">
                            Key foundational constraints and architectural principles active in this
                            build.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <Card className="flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-brand bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                    <Server className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-brand-secondary text-base">
                                    Single-Tenant Isolation
                                </h3>
                                <p className="text-xs text-brand-text-muted leading-normal">
                                    Every client instance is self-contained with its own database,
                                    domain, storage and credentials. Zero multi-tenant
                                    cross-contamination.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for cloning
                            </div>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-brand bg-brand-accent/20 text-amber-700 flex items-center justify-center">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-brand-secondary text-base">
                                    Dual Hosting Target
                                </h3>
                                <p className="text-xs text-brand-text-muted leading-normal">
                                    Pre-compiled release packages and dynamic queue fallbacks run on
                                    PHP shared hosting as reliably as cloud VPS.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Shared & VPS ready
                            </div>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-brand bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-brand-secondary text-base">
                                    Dynamic Theme Tokens
                                </h3>
                                <p className="text-xs text-brand-text-muted leading-normal">
                                    CSS variables bound to Tailwind v4 semantic tokens allow instant
                                    client brand color updates without recompiling frontend assets.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Design tokens active
                            </div>
                        </Card>

                        {/* Feature 4 */}
                        <Card className="flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="w-10 h-10 rounded-brand bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-brand-secondary text-base">
                                    Strict Security Controls
                                </h3>
                                <p className="text-xs text-brand-text-muted leading-normal">
                                    Zero hardcoded secrets, predictable default admin credentials
                                    forbidden, and strict environment configuration isolation.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Compliant & hardened
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Design Tokens & Theme Foundations Showcase */}
            <section id="tokens" className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                            <Badge variant="accent">Brand Token Foundation</Badge>
                            <h2 className="text-2xl font-bold text-brand-secondary mt-2">
                                Themeable Component System
                            </h2>
                            <p className="text-sm text-brand-text-muted mt-1">
                                Every component references semantic tokens mapped to CSS variables.
                                Client branding can be altered via environment or admin
                                configuration without rebuilding code.
                            </p>
                        </div>

                        {/* Token Palette Demo */}
                        <Card>
                            <h3 className="text-sm font-semibold text-brand-secondary mb-4 uppercase tracking-wider text-xs">
                                Active Design Tokens
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-3 rounded-brand bg-brand-surface-muted border border-brand-border">
                                    <div className="w-full h-8 rounded-brand bg-brand-primary mb-2 shadow-xs"></div>
                                    <p className="text-xs font-semibold text-brand-text">Primary</p>
                                    <p className="text-[10px] text-brand-text-muted font-mono">
                                        var(--brand-primary)
                                    </p>
                                </div>

                                <div className="p-3 rounded-brand bg-brand-surface-muted border border-brand-border">
                                    <div className="w-full h-8 rounded-brand bg-brand-secondary mb-2 shadow-xs"></div>
                                    <p className="text-xs font-semibold text-brand-text">
                                        Secondary
                                    </p>
                                    <p className="text-[10px] text-brand-text-muted font-mono">
                                        var(--brand-secondary)
                                    </p>
                                </div>

                                <div className="p-3 rounded-brand bg-brand-surface-muted border border-brand-border">
                                    <div className="w-full h-8 rounded-brand bg-brand-accent mb-2 shadow-xs"></div>
                                    <p className="text-xs font-semibold text-brand-text">Accent</p>
                                    <p className="text-[10px] text-brand-text-muted font-mono">
                                        var(--brand-accent)
                                    </p>
                                </div>

                                <div className="p-3 rounded-brand bg-brand-surface-muted border border-brand-border">
                                    <div className="w-full h-8 rounded-brand bg-brand-surface border border-brand-border mb-2 shadow-xs"></div>
                                    <p className="text-xs font-semibold text-brand-text">Surface</p>
                                    <p className="text-[10px] text-brand-text-muted font-mono">
                                        var(--brand-surface)
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-brand-border flex flex-wrap items-center gap-3">
                                <span className="text-xs text-brand-text-muted">
                                    Interactive Button Variants:
                                </span>
                                <Button variant="primary" size="sm">
                                    Primary
                                </Button>
                                <Button variant="secondary" size="sm">
                                    Secondary
                                </Button>
                                <Button variant="outline" size="sm">
                                    Outline
                                </Button>
                                <Button variant="ghost" size="sm">
                                    Ghost
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stack Verification & Health Status */}
            <section id="stack" className="py-12 bg-brand-surface border-t border-brand-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-brand-surface-muted border border-brand-border rounded-brand p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-brand-primary" />
                                <span className="text-base font-bold text-brand-secondary">
                                    Runtime & Environment Diagnostics
                                </span>
                            </div>
                            <p className="text-xs text-brand-text-muted">
                                Verified compatible with required baseline specifications.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="px-3 py-1.5 rounded-brand bg-brand-surface border border-brand-border font-mono">
                                Laravel: <strong>{laravelVersion}</strong>
                            </span>
                            <span className="px-3 py-1.5 rounded-brand bg-brand-surface border border-brand-border font-mono">
                                PHP: <strong>{phpVersion}</strong>
                            </span>
                            <span className="px-3 py-1.5 rounded-brand bg-brand-surface border border-brand-border font-mono">
                                Frontend: <strong>React 19 + Inertia v3</strong>
                            </span>
                            <span className="px-3 py-1.5 rounded-brand bg-brand-surface border border-brand-border font-mono">
                                CSS: <strong>Tailwind v4</strong>
                            </span>
                            <a
                                href="/up"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-brand bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold hover:bg-emerald-100 transition-colors"
                            >
                                Health Check (/up) →
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
