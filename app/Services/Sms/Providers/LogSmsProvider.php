<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\Log;

class LogSmsProvider implements SmsProviderInterface
{
    public function sendOtp(string $phone, string $code, string $purpose): bool
    {
        if (app()->environment('production')) {
            // In production, log provider should not be considered a real SMS delivery mechanism
            // and must never log raw plaintext OTPs
            Log::info('Production SMS log driver invoked without live SMS provider', [
                'phone' => substr($phone, 0, 4).'****'.substr($phone, -2),
                'purpose' => $purpose,
            ]);

            return false;
        }

        Log::info('SMS OTP generated (local/test driver)', [
            'phone' => $phone,
            'purpose' => $purpose,
            'code' => $code,
        ]);

        return true;
    }

    public function isConfigured(): bool
    {
        // Considered configured only in non-production environments
        return ! app()->environment('production');
    }

    public function getName(): string
    {
        return 'log';
    }
}
