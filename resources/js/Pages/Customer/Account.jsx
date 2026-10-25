import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Card from '../../Components/ui/Card';
import Button from '../../Components/ui/Button';
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Account({ profile, defaultAddress, addressCount }) {
    return (
        <CustomerLayout
            title="Account Dashboard"
            subtitle="Manage your personal information, addresses, and account security"
        >
            <Head title="My Account" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Overview Card */}
                <Card className="p-6 bg-brand-surface border border-brand-border rounded-brand">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-base text-brand-secondary">
                                Profile Details
                            </h3>
                        </div>
                        <Link
                            href="/account/profile"
                            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                        >
                            <span>Edit</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-brand-text-muted flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Full Name:
                            </span>
                            <span className="font-medium text-brand-text">{profile.name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-brand-text-muted flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> Email Address:
                            </span>
                            <div className="text-right">
                                <span className="font-medium text-brand-text">{profile.email || '—'}</span>
                                {!profile.email_verified && profile.email && (
                                    <span className="block text-[10px] text-amber-600 font-medium">
                                        (Unverified)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-brand-text-muted flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Mobile Phone:
                            </span>
                            <div className="text-right">
                                <span className="font-medium text-brand-text">{profile.phone || 'Not provided'}</span>
                                {profile.phone && !profile.phone_verified && (
                                    <span className="block text-[10px] text-amber-600 font-medium">
                                        (Unverified)
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-brand-text-muted flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Member Since:
                            </span>
                            <span className="font-medium text-brand-text">{profile.created_at}</span>
                        </div>
                    </div>
                </Card>

                {/* Default Address Card */}
                <Card className="p-6 bg-brand-surface border border-brand-border rounded-brand">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-base text-brand-secondary">
                                Default Shipping Address
                            </h3>
                        </div>
                        <Link
                            href="/account/addresses"
                            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                        >
                            <span>Manage ({addressCount})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="mt-4 text-xs">
                        {defaultAddress ? (
                            <div className="space-y-1.5 text-brand-text-muted">
                                <p className="font-semibold text-brand-text text-sm">
                                    {defaultAddress.recipient_name}
                                </p>
                                <p>{defaultAddress.address_line1}</p>
                                {defaultAddress.address_line2 && <p>{defaultAddress.address_line2}</p>}
                                <p>
                                    {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
                                </p>
                                <p>{defaultAddress.country_code} • {defaultAddress.phone}</p>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-brand-text-muted mb-3">No saved addresses yet.</p>
                                <Link href="/account/addresses">
                                    <Button size="sm" variant="outline">
                                        Add Shipping Address
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="bg-brand-surface border border-brand-border rounded-brand p-6">
                <h3 className="font-semibold text-base text-brand-secondary mb-3">
                    Account Security & Verification
                </h3>
                <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">
                    Keep your account secure with multi-factor recovery, verified email notifications,
                    and verified mobile phone numbers for instant order alerts.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Link href="/account/profile#security">
                        <Button size="sm" variant="outline" className="gap-2">
                            <ShieldCheck className="w-4 h-4 text-brand-primary" />
                            <span>Change Password</span>
                        </Button>
                    </Link>

                    {!profile.email_verified && (
                        <Link href="/email/verify">
                            <Button size="sm" variant="outline" className="gap-2">
                                <Mail className="w-4 h-4 text-amber-500" />
                                <span>Verify Email</span>
                            </Button>
                        </Link>
                    )}

                    <Link href="/account/profile#phone-verification">
                        <Button size="sm" variant="outline" className="gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span>{profile.phone ? 'Update Phone' : 'Add Mobile Phone'}</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
