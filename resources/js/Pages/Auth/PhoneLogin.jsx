import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import Alert from '../../Components/ui/Alert';
import { Smartphone, ArrowLeft } from 'lucide-react';

export default function PhoneLogin({ status, phone = '', cooldown = 0 }) {
    const { features, flash } = usePage().props;
    const [step, setStep] = useState(status && phone ? 'verify' : 'request');
    const [timeLeft, setTimeLeft] = useState(cooldown);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Send OTP Form
    const sendForm = useForm({
        phone: phone || '',
    });

    // Verify OTP Form
    const verifyForm = useForm({
        phone: phone || '',
        code: '',
    });

    const handleSendOtp = (e) => {
        e.preventDefault();
        sendForm.post('/auth/phone/send-otp', {
            onSuccess: (page) => {
                const newPhone = page.props.phone || sendForm.data.phone;
                verifyForm.setData('phone', newPhone);
                setTimeLeft(page.props.cooldown || 60);
                setStep('verify');
            },
        });
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        verifyForm.post('/auth/phone/verify-otp');
    };

    return (
        <StorefrontLayout>
            <Head title="Phone Number Sign In" />

            <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-6 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
                    {/* Header */}
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-brand-secondary">
                            {step === 'request' ? 'Sign in with Mobile' : 'Verify One-Time Code'}
                        </h2>
                        <p className="mt-1 text-xs text-brand-text-muted leading-relaxed">
                            {step === 'request'
                                ? 'Enter your mobile number to receive a secure 6-digit login code via SMS.'
                                : `Enter the 6-digit verification code sent to ${verifyForm.data.phone || sendForm.data.phone}.`}
                        </p>
                    </div>

                    {!features?.sms_auth && (
                        <Alert type="warning" title="SMS Provider Setup Required">
                            Live SMS delivery is currently unconfigured (requires TWILIO_SID / TWILIO_AUTH_TOKEN).
                        </Alert>
                    )}

                    {status && <Alert type="success">{status}</Alert>}
                    {flash?.error && <Alert type="error">{flash.error}</Alert>}

                    {step === 'request' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <Input
                                label="Phone Number (E.164 format)"
                                id="phone"
                                type="tel"
                                required
                                value={sendForm.data.phone}
                                onChange={(e) => {
                                    sendForm.setData('phone', e.target.value);
                                    verifyForm.setData('phone', e.target.value);
                                }}
                                error={sendForm.errors.phone}
                                placeholder="+1234567890"
                                helper="Include international country code (e.g. +1 for US, +44 for UK, +91 for India)."
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full mt-2"
                                disabled={sendForm.processing || !features?.sms_auth}
                            >
                                {sendForm.processing ? 'Sending code...' : 'Send Verification Code'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <Input
                                label="6-Digit Verification Code"
                                id="code"
                                type="text"
                                maxLength={6}
                                required
                                autoComplete="one-time-code"
                                value={verifyForm.data.code}
                                onChange={(e) => verifyForm.setData('code', e.target.value)}
                                error={verifyForm.errors.code}
                                placeholder="123456"
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full mt-2"
                                disabled={verifyForm.processing}
                            >
                                {verifyForm.processing ? 'Verifying...' : 'Verify & Sign In'}
                            </Button>

                            <div className="flex items-center justify-between text-xs pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('request')}
                                    className="text-brand-text-muted hover:text-brand-text font-medium"
                                >
                                    Change Phone Number
                                </button>

                                <button
                                    type="button"
                                    disabled={timeLeft > 0 || sendForm.processing}
                                    onClick={handleSendOtp}
                                    className="text-brand-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
                                >
                                    {timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend Code'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="pt-4 border-t border-brand-border text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-text-muted hover:text-brand-text transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Email Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
