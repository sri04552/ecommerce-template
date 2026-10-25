<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google OAuth authentication page.
     */
    public function redirect(): RedirectResponse
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()->route('login')->with(
                'error',
                'Google Sign-In is not currently configured for this store. Please use email or phone login.'
            );
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function callback(Request $request): RedirectResponse
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()->route('login')->with(
                'error',
                'Google Sign-In is not currently configured for this store.'
            );
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            Log::warning('Google OAuth callback failed: '.$e->getMessage());

            return redirect()->route('login')->with(
                'error',
                'Unable to authenticate with Google. Please try again or log in with your email/password.'
            );
        }

        $googleId = (string) $googleUser->getId();
        $googleEmail = $googleUser->getEmail();
        $rawPayload = $googleUser->getRaw();
        $isEmailVerifiedByGoogle = ! empty($rawPayload['email_verified']);

        if (empty($googleId)) {
            return redirect()->route('login')->with('error', 'Invalid identity received from Google.');
        }

        // 1. Check if user already linked via Google ID
        $user = User::where('google_id', $googleId)->first();

        if ($user) {
            if ($user->status !== 'active') {
                return redirect()->route('login')->with('error', 'This account has been deactivated.');
            }

            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->intended(route('account.dashboard'));
        }

        // 2. Safe account linking: Only link by email if Google marked it verified
        if (! empty($googleEmail)) {
            $existingUserByEmail = User::where('email', $googleEmail)->first();

            if ($existingUserByEmail) {
                if (! $isEmailVerifiedByGoogle) {
                    return redirect()->route('login')->with(
                        'error',
                        'Cannot link account: The email address reported by Google has not been verified.'
                    );
                }

                // If existing user already has a different Google ID, do not overwrite
                if (! empty($existingUserByEmail->google_id) && $existingUserByEmail->google_id !== $googleId) {
                    return redirect()->route('login')->with(
                        'error',
                        'This email account is already associated with another Google profile.'
                    );
                }

                if ($existingUserByEmail->status !== 'active') {
                    return redirect()->route('login')->with('error', 'This account has been deactivated.');
                }

                // Link Google ID safely
                $existingUserByEmail->update([
                    'google_id' => $googleId,
                    'email_verified_at' => $existingUserByEmail->email_verified_at ?? now(),
                ]);

                Auth::login($existingUserByEmail);
                $request->session()->regenerate();

                return redirect()->intended(route('account.dashboard'));
            }
        }

        // 3. Create new customer account
        $newUser = User::create([
            'name' => $googleUser->getName() ?: 'Customer',
            'email' => $googleEmail,
            'google_id' => $googleId,
            'email_verified_at' => $isEmailVerifiedByGoogle ? now() : null,
            'status' => 'active',
        ]);

        $customerRole = Role::firstOrCreate(
            ['name' => 'customer'],
            ['display_name' => 'Customer', 'description' => 'Store customer account']
        );
        $newUser->roles()->syncWithoutDetaching([$customerRole->id]);

        $profile = $newUser->customerProfile()->create();
        if ($avatar = $googleUser->getAvatar()) {
            $profile->update(['avatar_path' => $avatar]);
        }

        Auth::login($newUser);
        $request->session()->regenerate();

        return redirect()->intended(route('account.dashboard'));
    }
}
