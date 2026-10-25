export default function Card({ className = '', children, ...props }) {
    return (
        <div
            className={`bg-brand-surface border border-brand-border rounded-brand p-6 shadow-xs ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
