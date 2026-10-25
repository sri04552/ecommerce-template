import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Card from '../../Components/ui/Card';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import Alert from '../../Components/ui/Alert';
import { User, ShieldCheck, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile({ profile, cooldown = 0 }) {
    const { features } = usePage().props;

    // 1. General Profile Form
    const profileForm = useForm({
        name: profile.name || '',
        email: profile.email || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.put('/account/profile');
    };

    // 2. Password Change Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.put('/account/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    // 3. Phone Verification / Update Form
    const [phoneStep, setPhoneStep] = useState('input');
    const [phoneTimeLeft, setPhoneTimeLeft] = useState(cooldown);

    useEffect(() => {
        if (phoneTimeLeft <= 0) return;
        const timer = setInterval(() => {
            setPhoneTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [phoneTimeLeft]);

    const phoneSendForm = useForm({
        phone: profile.phone || '',
    });

    const phoneVerifyForm = useForm({
        phone: profile.phone || '',
        code: '',
    });

    const handleSendPhoneOtp = (e) => {
        e.preventDefault();
        phoneSendForm.post('/account/phone/send-otp', {
            onSuccess: (page) => {
                const targetPhone = page.props.pending_phone || phoneSendForm.data.phone;
                phoneVerifyForm.setData('phone', targetPhone);
                setPhoneTimeLeft(page.props.cooldown_remaining || 60);
                setPhoneStep('verify');
            },
        });
    };

    const handleVerifyPhoneOtp = (e) => {
        e.preventDefault();
        phoneVerifyForm.post('/account/phone/verify-otp', {
            onSuccess: () => {
                setPhoneStep('input');
                phoneVerifyForm.reset('code');
            },
        });
    };

    return (
        <CustomerLayout
            title="Profile & Security"
            subtitle="Update your personal details, verified contact channels, and password"
        >
            <Head title="Profile & Security" />

            {/* General Profile Section */}
            <Card className="p-6 bg-brand-surface border border-brand-border rounded-brand">
                <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border mb-6">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                    <h2 className="font-semibold text-base text-brand-secondary">
                        Personal Information
                    </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                    <Input
                        label="Full Name"
                        id="name"
                        required
                        value={profileForm.data.name}
                        onChange={(e) => profileForm.setData('name', e.target.value)}
                        error={profileForm.errors.name}
                    />

                    <div>
                        <Input
                            label="Email Address"
                            id="email"
                            type="email"
                            required
                            value={profileForm.data.email}
                            onChange={(e) => profileForm.setData('email', e.target.value)}
                            error={profileForm.errors.email}
                            helper="Changing your email will require verifying the new address."
                        />
                        <div className="mt-1 flex items-center gap-1.5 text-xs">
                            {profile.email_verified ? (
                                <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Email address is verified
                                </span>
                            ) : (
                                <span className="text-amber-600 flex items-center gap-1 font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" /> Email is not verified
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Birth Date"
                            id="birth_date"
                            type="date"
                            value={profileForm.data.birth_date}
                            onChange={(e) => profileForm.setData('birth_date', e.target.value)}
                            error={profileForm.errors.birth_date}
                        />

                        <div>
                            <label
                                htmlFor="gender"
                                className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5"
                            >
                                Gender
                            </label>
                            <select
                                id="gender"
                                value={profileForm.data.gender}
                                onChange={(e) => profileForm.setData('gender', e.target.value)}
                                className="w-full px-3.5 py-2 text-sm bg-brand-surface border border-brand-border rounded-brand text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                            {profileForm.errors.gender && (
                                <p className="mt-1 text-xs text-red-600">{profileForm.errors.gender}</p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={profileForm.processing}
                        className="mt-2"
                    >
                        {profileForm.processing ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                </form>
            </Card>

            {/* Phone Number & Verification Section */}
            <Card
                id="phone-verification"
                className="p-6 bg-brand-surface border border-brand-border rounded-brand"
            >
                <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base text-brand-secondary">
                            Mobile Phone Verification
                        </h2>
                        <p className="text-xs text-brand-text-muted mt-0.5">
                            Update or verify your phone number using a secure SMS one-time passcode
                        </p>
                    </div>
                </div>

                {!features?.sms_auth && (
                    <Alert type="warning" title="SMS Provider Setup Required" className="mb-4 max-w-xl">
                        SMS delivery requires active SMS provider configuration (e.g. TWILIO_SID / TWILIO_AUTH_TOKEN).
                    </Alert>
                )}

                <div className="max-w-xl space-y-4">
                    {phoneStep === 'input' ? (
                        <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                            <Input
                                label="Mobile Phone Number (E.164)"
                                id="update_phone"
                                type="tel"
                                required
                                value={phoneSendForm.data.phone}
                                onChange={(e) => {
                                    phoneSendForm.setData('phone', e.target.value);
                                    phoneVerifyForm.setData('phone', e.target.value);
                                }}
                                error={phoneSendForm.errors.phone}
                                placeholder="+1234567890"
                                helper="Include international country code prefix (e.g. +1, +44, +91)."
                            />

                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={phoneSendForm.processing || !features?.sms_auth}
                                >
                                    {phoneSendForm.processing
                                        ? 'Sending code...'
                                        : profile.phone
                                        ? 'Update & Verify Code'
                                        : 'Send Verification Code'}
                                </Button>

                                {profile.phone_verified && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                                        <CheckCircle2 className="w-4 h-4" /> Current phone verified
                                    </span>
                                )}
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                            <Alert type="info">
                                Enter the 6-digit code sent to {phoneVerifyForm.data.phone}.
                            </Alert>

                            <Input
                                label="6-Digit Verification Code"
                                id="phone_code"
                                type="text"
                                maxLength={6}
                                required
                                value={phoneVerifyForm.data.code}
                                onChange={(e) => phoneVerifyForm.setData('code', e.target.value)}
                                error={phoneVerifyForm.errors.code}
                                placeholder="123456"
                            />

                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={phoneVerifyForm.processing}
                                >
                                    {phoneVerifyForm.processing ? 'Verifying...' : 'Confirm Phone Update'}
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => setPhoneStep('input')}
                                    className="text-xs text-brand-text-muted hover:text-brand-text"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={phoneTimeLeft > 0 || phoneSendForm.processing}
                                    onClick={handleSendPhoneOtp}
                                    className="text-xs text-brand-primary disabled:opacity-50 hover:underline ml-auto"
                                >
                                    {phoneTimeLeft > 0 ? `Resend (${phoneTimeLeft}s)` : 'Resend Code'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>

            {/* Security & Password Section */}
            <Card
                id="security"
                className="p-6 bg-brand-surface border border-brand-border rounded-brand"
            >
                <div className="flex items-center gap-2.5 pb-4 border-b border-brand-border mb-6">
                    <div className="w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base text-brand-secondary">
                            Password & Security
                        </h2>
                        <p className="text-xs text-brand-text-muted mt-0.5">
                            Ensure your account uses a long, random password to stay secure
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                    {profile.has_password && (
                        <Input
                            label="Current Password"
                            id="current_password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={passwordForm.data.current_password}
                            onChange={(e) =>
                                passwordForm.setData('current_password', e.target.value)
                            }
                            error={passwordForm.errors.current_password}
                            placeholder="Enter current password"
                        />
                    )}

                    <Input
                        label="New Password"
                        id="new_password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={passwordForm.data.password}
                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                        error={passwordForm.errors.password}
                        placeholder="Minimum 8 characters"
                    />

                    <Input
                        label="Confirm New Password"
                        id="new_password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) =>
                            passwordForm.setData('password_confirmation', e.target.value)
                        }
                        error={passwordForm.errors.password_confirmation}
                        placeholder="Re-enter new password"
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={passwordForm.processing}
                        className="mt-2"
                    >
                        {passwordForm.processing ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </Card>
        </CustomerLayout>
    );
}
