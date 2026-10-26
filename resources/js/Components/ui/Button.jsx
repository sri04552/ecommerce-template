export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    children,
    ...props
}) {
    const baseStyles =
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-brand';

    const variants = {
        primary:
            'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary shadow-xs',
        secondary:
            'bg-brand-secondary text-white hover:opacity-90 focus:ring-brand-secondary shadow-xs',
        outline:
            'border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surface-muted focus:ring-brand-primary',
        ghost: 'text-brand-text hover:bg-brand-surface-muted focus:ring-brand-primary',
        white:
            'bg-white text-slate-950 hover:bg-amber-50 focus:ring-white shadow-sm font-semibold',
        accent:
            'bg-brand-accent text-white hover:opacity-95 focus:ring-brand-accent shadow-xs font-semibold',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
