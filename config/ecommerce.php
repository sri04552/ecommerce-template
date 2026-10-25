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
    'currency' => env('STORE_CURRENCY', 'USD'),
    'currency_symbol' => env('STORE_CURRENCY_SYMBOL', '$'),

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
