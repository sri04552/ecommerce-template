<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Ecommerce Platform') }}</title>

        <!-- Dynamic Brand Design Tokens -->
        <style id="brand-theme-tokens">
            :root {
                --brand-primary: {{ config('ecommerce.theme.primary_color', '#2563eb') }};
                --brand-primary-hover: {{ config('ecommerce.theme.primary_hover', '#1d4ed8') }};
                --brand-secondary: {{ config('ecommerce.theme.secondary_color', '#0f172a') }};
                --brand-accent: {{ config('ecommerce.theme.accent_color', '#f59e0b') }};
                --brand-surface: #ffffff;
                --brand-surface-muted: #f8fafc;
                --brand-text: #0f172a;
                --brand-text-muted: #64748b;
                --brand-border: #e2e8f0;
                --brand-radius: {{ config('ecommerce.theme.border_radius', '0.5rem') }};
            }
        </style>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts and Styles -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="bg-brand-surface-muted font-sans text-brand-text antialiased min-h-screen">
        @inertia
    </body>
</html>
