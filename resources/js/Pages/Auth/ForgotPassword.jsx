import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import Alert from '../../Components/ui/Alert';
import { KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <StorefrontLayout>
            <Head title="Forgot Password" />

            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                            Forgot your password?
                        </h2>
                        <p className="mt-2 text-xs text-brand-text-muted leading-relaxed">
                            No problem. Just enter your registered email address and we will email
                            you a secure password reset link.
                        </p>
                    </div>

                    {status && <Alert type="success">{status}</Alert>}

                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                        <Input
                            label="Email Address"
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            placeholder="you@example.com"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-2"
                            disabled={processing}
                        >
                            {processing ? 'Sending link...' : 'Email Password Reset Link'}
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-brand-border text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-text-muted hover:text-brand-text transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
