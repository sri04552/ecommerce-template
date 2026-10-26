import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
    showPasswordToggle = true,
    ...props
}) {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const computedType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

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
            <div className="relative">
                <input
                    id={inputId}
                    type={computedType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={`w-full px-3.5 py-2 text-sm bg-brand-surface border rounded-brand text-brand-text placeholder-brand-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50 disabled:bg-brand-surface-muted ${
                        isPasswordField && showPasswordToggle ? 'pr-10' : ''
                    } ${
                        error ? 'border-red-500 focus:ring-red-400' : 'border-brand-border'
                    }`}
                    {...props}
                />
                {isPasswordField && showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-text-muted hover:text-brand-text transition-colors focus:outline-none"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
            {helper && !error && <p className="mt-1 text-xs text-brand-text-muted">{helper}</p>}
        </div>
    );
}
