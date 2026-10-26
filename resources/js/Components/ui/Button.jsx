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
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-brand cursor-pointer';

    const variants = {
        primary:
            'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary shadow-xs active:scale-[0.99]',
        secondary:
            'bg-brand-secondary text-white hover:opacity-90 focus:ring-brand-secondary shadow-xs active:scale-[0.99]',
        outline:
            'border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-surface-muted hover:border-brand-primary/50 focus:ring-brand-primary',
        ghost: 'text-brand-text hover:bg-brand-surface-muted hover:text-brand-primary focus:ring-brand-primary',
        white:
            'bg-white text-brand-text hover:bg-brand-surface-muted hover:text-brand-primary focus:ring-brand-primary shadow-sm font-semibold border border-brand-border',
        accent:
            'bg-brand-accent text-white hover:opacity-95 focus:ring-brand-accent shadow-xs font-semibold active:scale-[0.99]',
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
