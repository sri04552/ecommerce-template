<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminIpWhitelist
{
    /**
     * Handle an incoming request.
     * Enforce client IP whitelist if configured via ADMIN_ALLOWED_IPS in .env.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $allowedIpsConfig = (string) config('ecommerce.admin_allowed_ips', '');
        $allowedIps = array_filter(array_map('trim', explode(',', $allowedIpsConfig)));

        // If no whitelist configured, allow access
        if (empty($allowedIps)) {
            return $next($request);
        }

        $clientIp = $request->ip();

        if (! in_array($clientIp, $allowedIps, true) && ! in_array('*', $allowedIps, true)) {
            abort(403, 'Access denied. Your IP address ('.$clientIp.') is not authorized to access this administration portal.');
        }

        return $next($request);
    }
}
