<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PhoneAuthController extends Controller
{
    public function __construct(
        protected OtpService $otpService
    ) {}

    /**
     * Display the phone login/OTP authentication view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/PhoneLogin', [
            'status' => session('status'),
            'phone' => session('phone'),
            'cooldown' => session('cooldown_remaining', 0),
        ]);
    }

    /**
     * Send an OTP to the given phone number for login.
     *
     * @throws ValidationException
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $throttleKey = 'send-otp:'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'phone' => "Too many OTP requests. Please wait {$seconds} seconds.",
            ]);
        }

        RateLimiter::hit($throttleKey, 60);

        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $result = $this->otpService->sendOtp($request->phone, 'login');

        if (! $result['success']) {
            throw ValidationException::withMessages([
                'phone' => $result['message'],
            ]);
        }

        return back()->with([
            'status' => $result['message'],
            'phone' => $this->otpService->normalizePhone($request->phone),
            'cooldown_remaining' => $result['cooldown_remaining'] ?? 60,
        ]);
    }

    /**
     * Verify the OTP and log the user in.
     *
     * @throws ValidationException
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $throttleKey = 'verify-otp:'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'code' => "Too many verification attempts. Please wait {$seconds} seconds.",
            ]);
        }

        RateLimiter::hit($throttleKey, 60);

        $request->validate([
            'phone' => ['required', 'string'],
            'code' => ['required', 'string'],
        ]);

        $result = $this->otpService->verifyOtp($request->phone, $request->code, 'login');

        if (! $result['success']) {
            throw ValidationException::withMessages([
                'code' => $result['message'],
            ]);
        }

        $normalizedPhone = $this->otpService->normalizePhone($request->phone);

        // Find or create customer account
        $user = User::where('phone', $normalizedPhone)->first();

        if (! $user) {
            $user = User::create([
                'name' => 'Customer '.substr($normalizedPhone, -4),
                'phone' => $normalizedPhone,
                'phone_verified_at' => now(),
                'status' => 'active',
            ]);

            $customerRole = Role::firstOrCreate(
                ['name' => 'customer'],
                ['display_name' => 'Customer', 'description' => 'Store customer account']
            );
            $user->roles()->syncWithoutDetaching([$customerRole->id]);
            $user->customerProfile()->create();
        } else {
            if ($user->status !== 'active') {
                throw ValidationException::withMessages([
                    'phone' => 'This account has been suspended or deactivated.',
                ]);
            }

            if (! $user->hasVerifiedPhone()) {
                $user->update(['phone_verified_at' => now()]);
            }
        }

        Auth::login($user);
        $request->session()->regenerate();
        RateLimiter::clear($throttleKey);

        return redirect()->intended(route('account.dashboard'));
    }
}
