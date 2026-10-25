<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    /**
     * Display a listing of the customer's addresses.
     */
    public function index(Request $request): Response
    {
        $addresses = $request->user()
            ->customerAddresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return Inertia::render('Customer/Addresses', [
            'addresses' => $addresses,
        ]);
    }

    /**
     * Store a newly created address in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:30'],
            'country_code' => ['required', 'string', 'size:2'],
            'type' => ['nullable', 'string', 'in:shipping,billing'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($user, $validated) {
            $isDefault = ! empty($validated['is_default']) || $user->customerAddresses()->count() === 0;

            if ($isDefault) {
                $user->customerAddresses()->update(['is_default' => false]);
            }

            $user->customerAddresses()->create([
                'recipient_name' => $validated['recipient_name'],
                'phone' => $validated['phone'],
                'address_line1' => $validated['address_line1'],
                'address_line2' => $validated['address_line2'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'country_code' => strtoupper($validated['country_code']),
                'type' => $validated['type'] ?? 'shipping',
                'is_default' => $isDefault,
            ]);
        });

        return back()->with('success', 'Address added successfully.');
    }

    /**
     * Update the specified address in storage.
     */
    public function update(Request $request, CustomerAddress $address): RedirectResponse
    {
        // Enforce strict ownership check
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to address record.');
        }

        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:30'],
            'country_code' => ['required', 'string', 'size:2'],
            'type' => ['nullable', 'string', 'in:shipping,billing'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $address, $validated) {
            $isDefault = ! empty($validated['is_default']);

            if ($isDefault) {
                $request->user()->customerAddresses()
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update([
                'recipient_name' => $validated['recipient_name'],
                'phone' => $validated['phone'],
                'address_line1' => $validated['address_line1'],
                'address_line2' => $validated['address_line2'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'country_code' => strtoupper($validated['country_code']),
                'type' => $validated['type'] ?? 'shipping',
                'is_default' => $isDefault,
            ]);
        });

        return back()->with('success', 'Address updated successfully.');
    }

    /**
     * Remove the specified address from storage.
     */
    public function destroy(Request $request, CustomerAddress $address): RedirectResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to address record.');
        }

        DB::transaction(function () use ($request, $address) {
            $wasDefault = $address->is_default;
            $address->delete();

            // If deleted address was default, promote another address to default if one exists
            if ($wasDefault) {
                $next = $request->user()->customerAddresses()->first();
                if ($next) {
                    $next->update(['is_default' => true]);
                }
            }
        });

        return back()->with('success', 'Address deleted successfully.');
    }

    /**
     * Mark the specified address as the default address.
     */
    public function setDefault(Request $request, CustomerAddress $address): RedirectResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to address record.');
        }

        DB::transaction(function () use ($request, $address) {
            $request->user()->customerAddresses()->update(['is_default' => false]);
            $address->update(['is_default' => true]);
        });

        return back()->with('success', 'Default address set successfully.');
    }
}
