export default function Badge({ variant = 'primary', className = '', children, ...props }) {
    const variants = {
        primary: 'bg-brand-surface-accent text-brand-primary border-brand-primary/25 font-semibold',
        secondary: 'bg-brand-secondary text-white border-transparent font-semibold',
        accent: 'bg-brand-primary/10 text-brand-accent border-brand-accent/25 font-semibold',
        outline: 'bg-brand-surface text-brand-text-muted border-brand-border font-medium',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
        warning: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
