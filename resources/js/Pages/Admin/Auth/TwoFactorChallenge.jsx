import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { ShieldCheck, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';

export default function TwoFactorChallenge({ adminEmail }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const [resending, setResending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/two-factor/verify');
    };

    const handleResend = () => {
        setResending(true);
        post('/admin/two-factor/resend', {
            onFinish: () => setResending(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
            <Head title="Two-Factor Security Verification" />

            <div className="max-w-md w-full bg-slate-800 border border-slate-700/80 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-center w-14 h-14 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                </div>

                <h1 className="text-xl font-bold text-center text-white">Security Verification</h1>
                <p className="text-sm text-center text-slate-400 mt-2">
                    Enter the 6-digit verification code sent to your registered admin email:
                </p>
                <div className="text-xs text-center font-mono font-medium text-indigo-300 bg-slate-900/60 py-1.5 px-3 rounded-lg mt-2 mx-auto max-w-xs truncate border border-slate-700">
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
                            className="w-full text-center text-3xl font-mono tracking-[12px] bg-slate-900 border border-slate-700 text-white rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.code && (
                            <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 justify-center">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.code}</span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || data.code.length !== 6}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <span>{processing ? 'Verifying...' : 'Verify & Continue'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Didn't receive code?</span>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                        <span>Resend Code</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
