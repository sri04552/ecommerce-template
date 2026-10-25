import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Alert({
    type = 'info',
    title,
    children,
    className = '',
    onClose,
}) {
    const config = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            icon: CheckCircle2,
            iconColor: 'text-emerald-500',
        },
        error: {
            bg: 'bg-rose-50 border-rose-200 text-rose-900',
            icon: AlertCircle,
            iconColor: 'text-rose-500',
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200 text-amber-900',
            icon: AlertTriangle,
            iconColor: 'text-amber-500',
        },
        info: {
            bg: 'bg-sky-50 border-sky-200 text-sky-900',
            icon: Info,
            iconColor: 'text-sky-500',
        },
    };

    const current = config[type] || config.info;
    const Icon = current.icon;

    return (
        <div
            className={`p-4 rounded-brand border text-sm flex items-start gap-3 relative ${current.bg} ${className}`}
            role="alert"
        >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
            <div className="flex-1">
                {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
                <div className="text-xs leading-relaxed">{children}</div>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded hover:bg-black/5 text-brand-text-muted shrink-0"
                    aria-label="Dismiss alert"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
