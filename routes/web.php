<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => app()->version(),
        'phpVersion' => PHP_VERSION,
        'storeName' => config('ecommerce.store_name', 'Ecommerce Store'),
        'themeConfig' => config('ecommerce.theme', []),
    ]);
});
