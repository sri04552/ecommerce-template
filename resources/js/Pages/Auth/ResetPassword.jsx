import { Head, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import { Lock } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <StorefrontLayout>
            <Head title="Reset Password" />

            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                            Reset your password
                        </h2>
                        <p className="mt-1 text-xs text-brand-text-muted">
                            Enter your new password below.
                        </p>
                    </div>

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

                        <Input
                            label="New Password"
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
                            label="Confirm New Password"
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={errors.password_confirmation}
                            placeholder="Confirm password"
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full mt-2"
                            disabled={processing}
                        >
                            {processing ? 'Resetting password...' : 'Reset Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </StorefrontLayout>
    );
}
