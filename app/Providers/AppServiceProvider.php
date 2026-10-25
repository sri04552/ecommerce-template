<?php

namespace App\Providers;

use App\Services\OtpService;
use App\Services\SettingsService;
use App\Services\Sms\SmsManager;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(SettingsService::class, function () {
            return new SettingsService;
        });

        $this->app->singleton(SmsManager::class, function () {
            return new SmsManager;
        });

        $this->app->singleton(OtpService::class, function ($app) {
            return new OtpService($app->make(SmsManager::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
            URL::forceScheme('https');
        }
    }
}
