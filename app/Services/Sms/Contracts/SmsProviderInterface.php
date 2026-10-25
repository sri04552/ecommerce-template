<?php

namespace App\Services\Sms\Contracts;

interface SmsProviderInterface
{
    /**
     * Send an OTP message to the recipient phone.
     */
    public function sendOtp(string $phone, string $code, string $purpose): bool;

    /**
     * Determine if provider credentials and configuration are present.
     */
    public function isConfigured(): bool;

    /**
     * Human-readable name of the SMS provider.
     */
    public function getName(): string;
}
