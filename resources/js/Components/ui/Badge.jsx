export default function Badge({ variant = 'primary', className = '', children, ...props }) {
    const variants = {
        primary: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
        secondary: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
        accent: 'bg-brand-accent/15 text-amber-700 border-amber-300',
        outline: 'bg-brand-surface text-brand-text-muted border-brand-border',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
