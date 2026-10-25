import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '../../Layouts/CustomerLayout';
import Card from '../../Components/ui/Card';
import Input from '../../Components/ui/Input';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { MapPin, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function Addresses({ addresses = [] }) {
    const [editingAddress, setEditingAddress] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form for Adding
    const createForm = useForm({
        recipient_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country_code: 'US',
        type: 'shipping',
        is_default: addresses.length === 0,
    });

    // Form for Editing
    const updateForm = useForm({
        recipient_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country_code: 'US',
        type: 'shipping',
        is_default: false,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/account/addresses', {
            onSuccess: () => {
                setIsAdding(false);
                createForm.reset();
            },
        });
    };

    const handleStartEdit = (address) => {
        setEditingAddress(address);
        setIsAdding(false);
        updateForm.setData({
            recipient_name: address.recipient_name,
            phone: address.phone,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country_code: address.country_code || 'US',
            type: address.type || 'shipping',
            is_default: Boolean(address.is_default),
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        updateForm.put(`/account/addresses/${editingAddress.id}`, {
            onSuccess: () => setEditingAddress(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to remove this address?')) {
            updateForm.delete(`/account/addresses/${id}`);
        }
    };

    const handleSetDefault = (id) => {
        updateForm.post(`/account/addresses/${id}/default`);
    };

    return (
        <CustomerLayout
            title="Saved Addresses"
            subtitle="Manage your shipping and billing delivery addresses"
        >
            <Head title="Addresses" />

            <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-brand-text-muted">
                    {addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}
                </span>
                {!isAdding && !editingAddress && (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setIsAdding(true)}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                    </Button>
                )}
            </div>

            {/* Add Address Form */}
            {isAdding && (
                <Card className="p-6 bg-brand-surface border border-brand-primary/30 rounded-brand mb-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
                        <h3 className="font-semibold text-base text-brand-secondary flex items-center gap-2">
                            <Plus className="w-4 h-4 text-brand-primary" />
                            Add Shipping Address
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="p-1 text-brand-text-muted hover:text-brand-text"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Recipient Name"
                                required
                                value={createForm.data.recipient_name}
                                onChange={(e) => createForm.setData('recipient_name', e.target.value)}
                                error={createForm.errors.recipient_name}
                                placeholder="Full name"
                            />
                            <Input
                                label="Phone Number"
                                required
                                value={createForm.data.phone}
                                onChange={(e) => createForm.setData('phone', e.target.value)}
                                error={createForm.errors.phone}
                                placeholder="Contact number"
                            />
                        </div>

                        <Input
                            label="Address Line 1"
                            required
                            value={createForm.data.address_line1}
                            onChange={(e) => createForm.setData('address_line1', e.target.value)}
                            error={createForm.errors.address_line1}
                            placeholder="Street address, P.O. box"
                        />

                        <Input
                            label="Address Line 2 (Optional)"
                            value={createForm.data.address_line2}
                            onChange={(e) => createForm.setData('address_line2', e.target.value)}
                            error={createForm.errors.address_line2}
                            placeholder="Apartment, suite, unit, building, floor"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="City"
                                required
                                value={createForm.data.city}
                                onChange={(e) => createForm.setData('city', e.target.value)}
                                error={createForm.errors.city}
                                placeholder="City"
                            />
                            <Input
                                label="State / Province"
                                required
                                value={createForm.data.state}
                                onChange={(e) => createForm.setData('state', e.target.value)}
                                error={createForm.errors.state}
                                placeholder="State"
                            />
                            <Input
                                label="Postal Code"
                                required
                                value={createForm.data.postal_code}
                                onChange={(e) => createForm.setData('postal_code', e.target.value)}
                                error={createForm.errors.postal_code}
                                placeholder="Postal code"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5">
                                    Country
                                </label>
                                <select
                                    value={createForm.data.country_code}
                                    onChange={(e) => createForm.setData('country_code', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-brand-surface border border-brand-border rounded-brand text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                    <option value="IN">India</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-text">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_default}
                                        onChange={(e) => createForm.setData('is_default', e.target.checked)}
                                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Set as default shipping address</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAdding(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={createForm.processing}
                            >
                                {createForm.processing ? 'Saving...' : 'Save Address'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Edit Address Form */}
            {editingAddress && (
                <Card className="p-6 bg-brand-surface border border-brand-primary/30 rounded-brand mb-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
                        <h3 className="font-semibold text-base text-brand-secondary flex items-center gap-2">
                            <Edit2 className="w-4 h-4 text-brand-primary" />
                            Edit Address
                        </h3>
                        <button
                            type="button"
                            onClick={() => setEditingAddress(null)}
                            className="p-1 text-brand-text-muted hover:text-brand-text"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleUpdateSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Recipient Name"
                                required
                                value={updateForm.data.recipient_name}
                                onChange={(e) => updateForm.setData('recipient_name', e.target.value)}
                                error={updateForm.errors.recipient_name}
                            />
                            <Input
                                label="Phone Number"
                                required
                                value={updateForm.data.phone}
                                onChange={(e) => updateForm.setData('phone', e.target.value)}
                                error={updateForm.errors.phone}
                            />
                        </div>

                        <Input
                            label="Address Line 1"
                            required
                            value={updateForm.data.address_line1}
                            onChange={(e) => updateForm.setData('address_line1', e.target.value)}
                            error={updateForm.errors.address_line1}
                        />

                        <Input
                            label="Address Line 2 (Optional)"
                            value={updateForm.data.address_line2}
                            onChange={(e) => updateForm.setData('address_line2', e.target.value)}
                            error={updateForm.errors.address_line2}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="City"
                                required
                                value={updateForm.data.city}
                                onChange={(e) => updateForm.setData('city', e.target.value)}
                                error={updateForm.errors.city}
                            />
                            <Input
                                label="State"
                                required
                                value={updateForm.data.state}
                                onChange={(e) => updateForm.setData('state', e.target.value)}
                                error={updateForm.errors.state}
                            />
                            <Input
                                label="Postal Code"
                                required
                                value={updateForm.data.postal_code}
                                onChange={(e) => updateForm.setData('postal_code', e.target.value)}
                                error={updateForm.errors.postal_code}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1.5">
                                    Country
                                </label>
                                <select
                                    value={updateForm.data.country_code}
                                    onChange={(e) => updateForm.setData('country_code', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm bg-brand-surface border border-brand-border rounded-brand text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                >
                                    <option value="US">United States</option>
                                    <option value="CA">Canada</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="AU">Australia</option>
                                    <option value="IN">India</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-text">
                                    <input
                                        type="checkbox"
                                        checked={updateForm.data.is_default}
                                        onChange={(e) => updateForm.setData('is_default', e.target.checked)}
                                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span>Set as default shipping address</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingAddress(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={updateForm.processing}
                            >
                                {updateForm.processing ? 'Saving...' : 'Update Address'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Address List */}
            {addresses.length === 0 && !isAdding ? (
                <div className="text-center py-12 bg-brand-surface border border-brand-border rounded-brand p-8">
                    <MapPin className="w-10 h-10 text-brand-text-muted mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-brand-secondary mb-1">
                        No addresses saved
                    </h3>
                    <p className="text-xs text-brand-text-muted mb-4 max-w-sm mx-auto">
                        Add a shipping address to speed up future checkouts.
                    </p>
                    <Button size="sm" variant="primary" onClick={() => setIsAdding(true)}>
                        Add Your First Address
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <Card
                            key={address.id}
                            className={`p-5 bg-brand-surface border rounded-brand relative flex flex-col justify-between ${
                                address.is_default
                                    ? 'border-brand-primary ring-1 ring-brand-primary/20'
                                    : 'border-brand-border'
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-semibold text-sm text-brand-secondary">
                                        {address.recipient_name}
                                    </h4>
                                    {address.is_default && (
                                        <Badge variant="primary" className="text-[10px]">
                                            Default
                                        </Badge>
                                    )}
                                </div>

                                <div className="text-xs text-brand-text-muted space-y-1">
                                    <p>{address.address_line1}</p>
                                    {address.address_line2 && <p>{address.address_line2}</p>}
                                    <p>
                                        {address.city}, {address.state} {address.postal_code}
                                    </p>
                                    <p>{address.country_code} • {address.phone}</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                                <div>
                                    {!address.is_default && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetDefault(address.id)}
                                            className="font-medium text-brand-primary hover:underline flex items-center gap-1"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Set as Default</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleStartEdit(address)}
                                        className="text-brand-text-muted hover:text-brand-text p-1"
                                        aria-label="Edit address"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(address.id)}
                                        className="text-rose-500 hover:text-rose-700 p-1"
                                        aria-label="Delete address"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </CustomerLayout>
    );
}
