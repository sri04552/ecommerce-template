<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Store Configuration
    |--------------------------------------------------------------------------
    |
    | Basic store settings and branding metadata. In future phases, these
    | can be managed dynamically via the Admin Settings panel and stored
    | in the database with these values serving as reliable defaults.
    |
    */
    'store_name' => env('APP_NAME', 'Ecommerce Store'),
    'currency' => env('STORE_CURRENCY', 'INR'),
    'currency_symbol' => env('STORE_CURRENCY_SYMBOL', '₹'),

    /*
    |--------------------------------------------------------------------------
    | Admin Portal Security Configurations
    |--------------------------------------------------------------------------
    |
    | - admin_prefix: Custom URL slug for the administration portal.
    | - admin_allowed_ips: Comma-separated list of allowed IPs for admin access.
    | - admin_2fa_enabled: Whether 2-Factor OTP verification is enforced for admins.
    |
    */
    'admin_prefix' => env('ADMIN_PREFIX', 'admin'),
    'admin_allowed_ips' => env('ADMIN_ALLOWED_IPS', ''),
    'admin_2fa_enabled' => env('ADMIN_2FA_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Theme and Brand Design Tokens
    |--------------------------------------------------------------------------
    |
    | Foundational design tokens used across the application to provide
    | customizable client themes without modifying compiled assets.
    |
    */
    'theme' => [
        'active' => env('ACTIVE_THEME', 'modern'),
        'primary_color' => env('THEME_PRIMARY_COLOR', '#2563eb'),
        'primary_hover' => env('THEME_PRIMARY_HOVER', '#1d4ed8'),
        'secondary_color' => env('THEME_SECONDARY_COLOR', '#0f172a'),
        'accent_color' => env('THEME_ACCENT_COLOR', '#f59e0b'),
        'border_radius' => env('THEME_BORDER_RADIUS', '0.5rem'),
    ],
];
