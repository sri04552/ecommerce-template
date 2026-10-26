<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminTwoFactorCodeMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorAuthController extends Controller
{
    /**
     * Show the 2FA verification challenge screen.
     */
    public function challenge(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($request->session()->get('admin_2fa_verified') === true) {
            return redirect()->route('admin.orders.index');
        }

        // If no code sent or code expired, dispatch a new one
        $codeExpiresAt = $request->session()->get('admin_2fa_expires_at');
        if (! $request->session()->has('admin_2fa_code') || now()->gt($codeExpiresAt)) {
            $this->generateAndSendCode($request, $user);
        }

        return Inertia::render('Admin/Auth/TwoFactorChallenge', [
            'adminEmail' => $user->email,
            'sentRecently' => true,
        ]);
    }

    /**
     * Verify the submitted 2FA code.
     */
    public function verify(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'size:6'],
            'remember_device' => ['nullable', 'boolean'],
        ]);

        $storedCode = $request->session()->get('admin_2fa_code');
        $expiresAt = $request->session()->get('admin_2fa_expires_at');

        if (! $storedCode || now()->gt($expiresAt)) {
            return back()->withErrors(['code' => 'Verification code expired. Please request a new one.']);
        }

        if (trim($validated['code']) !== (string) $storedCode) {
            return back()->withErrors(['code' => 'Invalid security verification code. Please try again.']);
        }

        // Clear code and set verified
        $user = $request->user();
        $request->session()->forget(['admin_2fa_code', 'admin_2fa_expires_at']);
        $request->session()->put('admin_2fa_verified', true);

        $response = redirect()->intended(route('admin.orders.index'))->with('success', 'Security verification completed.');

        if ($request->boolean('remember_device')) {
            $signature = hash_hmac('sha256', 'admin_trust_'.$user->id, config('app.key'));
            // 30 days = 43200 minutes
            $response->withCookie(cookie('admin_trusted_device', $signature, 43200, null, null, false, true));
        }

        return $response;
    }

    /**
     * Resend a new 2FA code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();
        $this->generateAndSendCode($request, $user);

        return back()->with('success', 'A new 6-digit verification code has been dispatched to your email.');
    }

    /**
     * Helper to generate a 6-digit OTP and send email.
     */
    protected function generateAndSendCode(Request $request, $user): void
    {
        $otp = (string) random_int(100000, 999999);
        $request->session()->put('admin_2fa_code', $otp);
        $request->session()->put('admin_2fa_expires_at', now()->addMinutes(10));

        try {
            Mail::to($user->email)->send(new AdminTwoFactorCodeMail($user, $otp));
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch Admin 2FA email: '.$e->getMessage());
        }
    }
}
