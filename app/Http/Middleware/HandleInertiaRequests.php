<?php

namespace App\Http\Middleware;

use App\Services\Sms\SmsManager;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing('roles');
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'email_verified' => $user->hasVerifiedEmail(),
                    'phone_verified' => $user->hasVerifiedPhone(),
                    'status' => $user->status,
                    'is_customer' => $user->isCustomer(),
                    'roles' => $user->roles->pluck('name')->toArray(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'features' => [
                'google_auth' => ! empty(config('services.google.client_id')),
                'sms_auth' => app(SmsManager::class)->isConfigured(),
            ],
            'storeSettings' => [
                'store_name' => config('ecommerce.store_name', 'Ecommerce Store'),
                'announcement_text' => 'Free standard shipping on all orders over $75',
                'currency' => 'USD',
            ],
        ];
    }
}
