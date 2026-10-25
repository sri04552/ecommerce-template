import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Button from '../../Components/ui/Button';
import Alert from '../../Components/ui/Alert';
import { MailCheck, LogOut } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const handleResend = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <StorefrontLayout>
            <Head title="Verify Email Address" />

            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-2">
                        <MailCheck className="w-6 h-6" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                        Verify your email address
                    </h2>

                    <p className="text-xs text-brand-text-muted leading-relaxed">
                        Thanks for registering! Before getting started, could you verify your email
                        address by clicking on the link we just emailed to you? If you didn't receive
                        the email, we will gladly send you another.
                    </p>

                    {status === 'verification-link-sent' && (
                        <Alert type="success">
                            A new verification link has been sent to the email address you provided during registration.
                        </Alert>
                    )}

                    <form onSubmit={handleResend} className="mt-6">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Resend Verification Email'}
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-brand-border flex items-center justify-between text-xs">
                        <Link
                            href="/account"
                            className="text-brand-text-muted hover:text-brand-text transition-colors"
                        >
                            Back to Account
                        </Link>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-medium"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
