<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Display the customer dashboard overview.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $user->loadMissing(['customerProfile', 'customerAddresses']);

        $defaultAddress = $user->customerAddresses->firstWhere('is_default', true)
            ?? $user->customerAddresses->first();

        return Inertia::render('Customer/Account', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'email_verified' => $user->hasVerifiedEmail(),
                'phone_verified' => $user->hasVerifiedPhone(),
                'created_at' => $user->created_at->format('M d, Y'),
                'avatar_path' => $user->customerProfile?->avatar_path,
                'birth_date' => $user->customerProfile?->birth_date?->format('Y-m-d'),
                'gender' => $user->customerProfile?->gender,
            ],
            'defaultAddress' => $defaultAddress,
            'addressCount' => $user->customerAddresses->count(),
        ]);
    }

    /**
     * Display the profile edit page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $user->loadMissing('customerProfile');

        return Inertia::render('Customer/Profile', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'email_verified' => $user->hasVerifiedEmail(),
                'phone_verified' => $user->hasVerifiedPhone(),
                'birth_date' => $user->customerProfile?->birth_date?->format('Y-m-d'),
                'gender' => $user->customerProfile?->gender,
                'has_password' => ! empty($user->password),
            ],
            'status' => session('status'),
            'cooldown' => session('cooldown_remaining', 0),
        ]);
    }

    /**
     * Update the customer's general profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'string', 'in:male,female,other,prefer_not_to_say'],
        ]);

        $emailChanged = $user->isDirty('email') || $user->email !== $validated['email'];

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($emailChanged) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Update profile details
        $profile = $user->customerProfile ?? $user->customerProfile()->create();
        $profile->update([
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'] ?? null,
        ]);

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();

            return back()->with(
                'success',
                'Profile updated. Since you changed your email address, a new verification link has been sent.'
            );
        }

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update the customer's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $rules = [
            'password' => ['required', 'confirmed', Password::defaults()],
        ];

        // If user already has a password set, require current_password
        if (! empty($user->password)) {
            $rules['current_password'] = ['required', 'current_password'];
        }

        $validated = $request->validate($rules);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Request an OTP for phone number verification or update.
     *
     * @throws ValidationException
     */
    public function sendPhoneOtp(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'phone' => ['required', 'string', Rule::unique('users', 'phone')->ignore($user->id)],
        ]);

        $result = $this->otpService->sendOtp($request->phone, 'phone_update', $user->id);

        if (! $result['success']) {
            throw ValidationException::withMessages([
                'phone' => $result['message'],
            ]);
        }

        return back()->with([
            'success' => $result['message'],
            'pending_phone' => $this->otpService->normalizePhone($request->phone),
            'cooldown_remaining' => $result['cooldown_remaining'] ?? 60,
        ]);
    }

    /**
     * Verify OTP and update user phone number.
     *
     * @throws ValidationException
     */
    public function verifyPhoneOtp(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'phone' => ['required', 'string', Rule::unique('users', 'phone')->ignore($user->id)],
            'code' => ['required', 'string'],
        ]);

        $result = $this->otpService->verifyOtp($request->phone, $request->code, 'phone_update');

        if (! $result['success']) {
            throw ValidationException::withMessages([
                'code' => $result['message'],
            ]);
        }

        $normalizedPhone = $this->otpService->normalizePhone($request->phone);

        $user->update([
            'phone' => $normalizedPhone,
            'phone_verified_at' => now(),
        ]);

        return back()->with('success', 'Phone number verified and updated successfully.');
    }
}
