import { Head, Link, useForm, usePage } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import Alert from '../../Components/ui/Alert';
import GoogleIcon from '../../Components/icons/GoogleIcon';
import { UserPlus, Smartphone } from 'lucide-react';

export default function Register({ status }) {
    const { features, flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <StorefrontLayout>
            <Head title="Create Customer Account" />

            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
                    {/* Header */}
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                            Create your account
                        </h2>
                        <p className="mt-2 text-xs text-brand-text-muted">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    {status && <Alert type="info">{status}</Alert>}
                    {flash?.error && <Alert type="error">{flash.error}</Alert>}

                    {/* Registration Form */}
                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            id="name"
                            type="text"
                            required
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="John Doe"
                        />

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

                        <Input
                            label="Password"
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder="Minimum 8 characters"
                        />

                        <Input
                            label="Confirm Password"
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            placeholder="Re-enter password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-4"
                            disabled={processing}
                        >
                            {processing ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    {/* Alternative Sign-In Options */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-brand-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-brand-surface px-2 text-brand-text-muted font-medium">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {features?.google_auth ? (
                            <a
                                href="/auth/google/redirect"
                                className="flex items-center justify-center gap-2 px-3 py-2 border border-brand-border rounded-brand text-xs font-semibold text-brand-text hover:bg-brand-surface-muted transition-colors shadow-xs"
                            >
                                <GoogleIcon className="w-4 h-4" />
                                <span>Google</span>
                            </a>
                        ) : (
                            <div
                                title="Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
                                className="flex items-center justify-center gap-2 px-3 py-2 border border-brand-border/60 rounded-brand text-xs font-medium text-brand-text-muted/60 bg-brand-surface-muted/50 cursor-not-allowed"
                            >
                                <GoogleIcon className="w-4 h-4 opacity-40" />
                                <span>Google (Setup Req.)</span>
                            </div>
                        )}

                        <Link
                            href="/auth/phone"
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-brand-border rounded-brand text-xs font-semibold text-brand-text hover:bg-brand-surface-muted transition-colors shadow-xs"
                        >
                            <Smartphone className="w-4 h-4 text-brand-primary" />
                            <span>Phone OTP</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
