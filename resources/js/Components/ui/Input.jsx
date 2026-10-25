export default function Input({
    label,
    id,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    helper = '',
    required = false,
    disabled = false,
    className = '',
    autoComplete,
    ...props
}) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                className={`w-full px-3.5 py-2 text-sm bg-brand-surface border rounded-brand text-brand-text placeholder-brand-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50 disabled:bg-brand-surface-muted ${
                    error ? 'border-red-500 focus:ring-red-400' : 'border-brand-border'
                }`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
            {helper && !error && <p className="mt-1 text-xs text-brand-text-muted">{helper}</p>}
        </div>
    );
}
