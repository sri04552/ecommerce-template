<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminTwoFactorMiddleware
{
    /**
     * Handle an incoming request.
     * Enforce 2FA session verification if ADMIN_2FA_ENABLED is true.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $twoFactorEnabled = filter_var(config('ecommerce.admin_2fa_enabled', false), FILTER_VALIDATE_BOOLEAN);

        if (! $twoFactorEnabled) {
            return $next($request);
        }

        $user = $request->user();

        // If user is not authenticated or not an admin, standard auth/admin middleware will handle it
        if (! $user || (! $user->hasRole('admin') && ! $user->hasRole('super_admin') && ! $user->hasRole('manager'))) {
            return $next($request);
        }

        // If session is already verified for this session
        if ($request->session()->get('admin_2fa_verified') === true) {
            return $next($request);
        }

        // Check for trusted multi-device authorization cookie (e.g., remembered for 30 days)
        $trustedCookie = $request->cookie('admin_trusted_device');
        if ($trustedCookie) {
            $expectedSignature = hash_hmac('sha256', 'admin_trust_'.$user->id, config('app.key'));
            if (hash_equals($expectedSignature, $trustedCookie)) {
                $request->session()->put('admin_2fa_verified', true);

                return $next($request);
            }
        }

        // Exclude 2FA challenge and verification endpoints themselves
        if ($request->routeIs('admin.2fa.*')) {
            return $next($request);
        }

        return redirect()->route('admin.2fa.challenge');
    }
}
