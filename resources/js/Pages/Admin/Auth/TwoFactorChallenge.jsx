import { useState } from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import { ShieldCheck, ArrowRight, RotateCw, AlertCircle, Laptop, Smartphone } from 'lucide-react';
import Button from '@/Components/ui/Button';

export default function TwoFactorChallenge({ adminEmail }) {
    const { storeSettings } = usePage().props;
    const adminPrefix = storeSettings?.admin_prefix || 'admin';

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        remember_device: true,
    });

    const [resending, setResending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/${adminPrefix}/two-factor/verify`);
    };

    const handleResend = () => {
        setResending(true);
        post(`/${adminPrefix}/two-factor/resend`, {
            onFinish: () => setResending(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans text-slate-100">
            <Head title="Two-Factor Security Verification" />

            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-center w-14 h-14 bg-brand-primary/20 text-pink-400 border border-brand-primary/30 rounded-2xl mx-auto mb-5">
                    <ShieldCheck className="w-8 h-8" />
                </div>

                <h1 className="text-xl font-bold text-center text-white">Security Verification</h1>
                <p className="text-xs text-center text-slate-400 mt-2">
                    Enter the 6-digit verification code dispatched to your registered admin email:
                </p>
                <div className="text-xs text-center font-mono font-medium text-pink-300 bg-slate-950 py-1.5 px-3 rounded-lg mt-2 mx-auto max-w-xs truncate border border-slate-800">
                    {adminEmail}
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                            6-Digit Security Code
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                            placeholder="······"
                            autoFocus
                            className="w-full text-center text-3xl font-mono tracking-[12px] bg-slate-950 border border-slate-700 text-white rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        />
                        {errors.code && (
                            <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 justify-center">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.code}</span>
                            </div>
                        )}
                    </div>

                    {/* Trust this device for 30 days (Real-world multi-device security) */}
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember_device}
                                onChange={(e) => setData('remember_device', e.target.checked)}
                                className="mt-0.5 rounded border-slate-700 text-brand-primary focus:ring-brand-primary bg-slate-900"
                            />
                            <div className="text-xs">
                                <span className="font-semibold text-slate-200 block">Trust this device for 30 days</span>
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                    Skip 2FA verification code on this browser for the next month.
                                </span>
                            </div>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || data.code.length !== 6}
                        className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                        <span>{processing ? 'Verifying...' : 'Authorize Device & Continue'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Didn't receive code?</span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="inline-flex items-center gap-1.5 text-brand-accent hover:text-pink-300 font-medium disabled:opacity-50"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                        <span>Resend Code</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
