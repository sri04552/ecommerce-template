<?php

use App\Http\Controllers\Admin\AbandonedCartController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\TwoFactorAuthController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\PhoneAuthController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Customer\AddressController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\WishlistController;
use App\Http\Controllers\Storefront\CatalogController;
use App\Http\Controllers\Storefront\CouponController as StorefrontCouponController;
use App\Http\Controllers\Storefront\OrderController as StorefrontOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Storefront Catalog Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [CatalogController::class, 'home'])->name('home');
Route::get('/products', [CatalogController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [CatalogController::class, 'show'])->name('products.show');
Route::get('/categories/{slug}', [CatalogController::class, 'category'])->name('categories.show');
Route::get('/cart', function () {
    return Inertia::render('Cart/Index');
})->name('cart.index');
Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
Route::get('/about', [CatalogController::class, 'about'])->name('about');
Route::get('/track', [StorefrontOrderController::class, 'track'])->name('orders.track');
Route::get('/orders/{order}/invoice', [StorefrontOrderController::class, 'invoice'])->name('orders.invoice');
Route::post('/api/coupons/apply', [StorefrontCouponController::class, 'apply'])->name('coupons.apply');
Route::post('/api/webhooks/shipping/tracking', [AdminOrderController::class, 'trackingWebhook'])->name('webhooks.shipping.tracking');
Route::post('/api/wishlist/{product}/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
Route::get('/api/wishlist/{product}/status', [WishlistController::class, 'status'])->name('wishlist.status');
Route::post('/checkout/place-order', [StorefrontOrderController::class, 'placeOrder'])->name('checkout.place');
Route::post('/products/{product}/reviews', [StorefrontOrderController::class, 'storeReview'])->name('products.reviews.store');
Route::post('/orders/{order}/request-return', [StorefrontOrderController::class, 'requestReturn'])->name('orders.request-return');

/*
|--------------------------------------------------------------------------
| Guest Authentication Routes
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    // Registration
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);

    // Standard Login
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // Phone / OTP Authentication
    Route::get('auth/phone', [PhoneAuthController::class, 'create'])->name('auth.phone');
    Route::post('auth/phone/send-otp', [PhoneAuthController::class, 'sendOtp'])->name('auth.phone.send-otp');
    Route::post('auth/phone/verify-otp', [PhoneAuthController::class, 'verifyOtp'])->name('auth.phone.verify-otp');

    // Google OAuth
    Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    // Password Recovery
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.update');
});

/*
|--------------------------------------------------------------------------
| Authenticated Customer Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    // Logout
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    // Email Verification Notice & Processing
    Route::get('email/verify', EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('email/verify/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // Customer Account & Profile
    Route::prefix('account')->name('account.')->group(function () {
        Route::get('/', [ProfileController::class, 'index'])->name('dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.change');
        Route::post('/sessions/logout-other-devices', [ProfileController::class, 'logoutOtherDevices'])->name('profile.logout-other-devices');

        // Phone Update & Verification
        Route::post('/phone/send-otp', [ProfileController::class, 'sendPhoneOtp'])->name('phone.send-otp');
        Route::post('/phone/verify-otp', [ProfileController::class, 'verifyPhoneOtp'])->name('phone.verify-otp');

        // Address Management
        Route::get('/addresses', [AddressController::class, 'index'])->name('addresses.index');
        Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
        Route::put('/addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
        Route::post('/addresses/{address}/default', [AddressController::class, 'setDefault'])->name('addresses.default');

        // Customer Orders
        Route::get('/orders', [StorefrontOrderController::class, 'customerOrders'])->name('orders');

        // Customer Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
    });
});

/*
|--------------------------------------------------------------------------
| Authenticated Administrator Routes (Hardened & Dynamically Prefixed)
|--------------------------------------------------------------------------
*/
$adminPrefix = config('ecommerce.admin_prefix', env('ADMIN_PREFIX', 'admin'));

// 2FA Challenge & Verification (Guarded by auth & admin role)
Route::prefix($adminPrefix)->name('admin.')->middleware(['auth', 'admin', 'admin.ip'])->group(function () {
    Route::get('/two-factor/challenge', [TwoFactorAuthController::class, 'challenge'])->name('2fa.challenge');
    Route::post('/two-factor/verify', [TwoFactorAuthController::class, 'verify'])->name('2fa.verify');
    Route::post('/two-factor/resend', [TwoFactorAuthController::class, 'resend'])->name('2fa.resend');
});

// Full Administrative Operations (Guarded by auth, admin role, and multi-device 2fa)
Route::prefix($adminPrefix)->name('admin.')->middleware(['auth', 'admin', 'admin.ip', 'admin.2fa'])->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard.redirect');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [AdminDashboardController::class, 'index'])->name('analytics');

    // Products Management
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/products/export', [AdminProductController::class, 'export'])->name('products.export');
    Route::get('/products/import-template', [AdminProductController::class, 'importTemplate'])->name('products.import-template');
    Route::post('/products/import', [AdminProductController::class, 'import'])->name('products.import');
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/{product}/toggle-status', [AdminProductController::class, 'toggleStatus'])->name('products.toggle-status');

    // Category Management
    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    // Inventory & Stock Management
    Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/{variant}/adjust', [AdminInventoryController::class, 'adjust'])->name('inventory.adjust');

    // Orders Management & Returns
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/update-status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::post('/orders/{order}/generate-shiprocket-awb', [AdminOrderController::class, 'generateShiprocketAwb'])->name('orders.generate-shiprocket-awb');
    Route::post('/returns/{return}/update-status', [AdminOrderController::class, 'updateReturn'])->name('returns.update-status');
    Route::post('/returns/{return}/process-refund', [AdminOrderController::class, 'processRefund'])->name('returns.process-refund');

    // Promotions & Coupons Management
    Route::get('/coupons', [AdminCouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [AdminCouponController::class, 'store'])->name('coupons.store');
    Route::put('/coupons/{coupon}', [AdminCouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{coupon}', [AdminCouponController::class, 'destroy'])->name('coupons.destroy');
    Route::post('/coupons/{coupon}/toggle-status', [AdminCouponController::class, 'toggleStatus'])->name('coupons.toggle-status');

    // Abandoned Carts Management
    Route::get('/abandoned-carts', [AbandonedCartController::class, 'index'])->name('abandoned-carts.index');
    Route::post('/abandoned-carts/{cart}/send-recovery', [AbandonedCartController::class, 'sendRecovery'])->name('abandoned-carts.send-recovery');
});
