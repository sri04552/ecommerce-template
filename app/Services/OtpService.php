<?php

namespace App\Services;

use App\Models\PhoneVerificationCode;
use App\Services\Sms\SmsManager;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class OtpService
{
    public const OTP_LENGTH = 6;

    public const EXPIRATION_MINUTES = 5;

    public const RESEND_COOLDOWN_SECONDS = 60;

    public const MAX_ATTEMPTS = 3;

    public function __construct(
        protected SmsManager $smsManager
    ) {}

    /**
     * Normalize a phone number to standard format (+ followed by digits).
     */
    public function normalizePhone(string $phone, string $defaultCountryCode = '1'): string
    {
        // Strip everything except digits and leading plus
        $cleaned = preg_replace('/[^\d+]/', '', trim($phone)) ?: '';

        if (! str_starts_with($cleaned, '+')) {
            $digits = ltrim($cleaned, '0');
            // If 10-digit national number, prefix default country code
            if (strlen($digits) === 10) {
                $cleaned = '+'.$defaultCountryCode.$digits;
            } else {
                $cleaned = '+'.$digits;
            }
        }

        return $cleaned;
    }

    /**
     * Validate whether the phone number conforms to an acceptable E.164-style standard.
     */
    public function isValidPhone(string $phone): bool
    {
        $normalized = $this->normalizePhone($phone);

        // Standard E.164 phone numbers: + followed by 8 to 15 digits
        return (bool) preg_match('/^\+[1-9]\d{7,14}$/', $normalized);
    }

    /**
     * Request and send a new OTP to a phone number.
     *
     * @return array{
     *     success: bool,
     *     message: string,
     *     cooldown_remaining?: int,
     *     unconfigured?: bool
     * }
     */
    public function sendOtp(string $phone, string $purpose = 'login', ?int $userId = null): array
    {
        $normalizedPhone = $this->normalizePhone($phone);

        if (! $this->isValidPhone($normalizedPhone)) {
            return [
                'success' => false,
                'message' => 'Please provide a valid phone number including country code (e.g. +1234567890).',
            ];
        }

        // Check for resend cooldown
        $latestRecord = PhoneVerificationCode::where('phone', $normalizedPhone)
            ->where('purpose', $purpose)
            ->latest()
            ->first();

        if ($latestRecord && ! $latestRecord->isVerified()) {
            $elapsedSeconds = Carbon::now()->diffInSeconds($latestRecord->created_at);
            if ($elapsedSeconds < self::RESEND_COOLDOWN_SECONDS) {
                $cooldownRemaining = self::RESEND_COOLDOWN_SECONDS - $elapsedSeconds;

                return [
                    'success' => false,
                    'message' => "Please wait {$cooldownRemaining} seconds before requesting a new code.",
                    'cooldown_remaining' => $cooldownRemaining,
                ];
            }
        }

        // Verify that SMS service is configured
        if (! $this->smsManager->isConfigured()) {
            return [
                'success' => false,
                'unconfigured' => true,
                'message' => 'SMS service is not currently configured for this store. Please contact support.',
            ];
        }

        // Invalidate any previous unverified OTPs for this phone and purpose
        PhoneVerificationCode::where('phone', $normalizedPhone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->delete();

        // Generate cryptographically secure OTP
        $rawOtp = (string) random_int(100000, 999999);

        // Store hashed code
        PhoneVerificationCode::create([
            'phone' => $normalizedPhone,
            'code_hash' => Hash::make($rawOtp),
            'purpose' => $purpose,
            'user_id' => $userId,
            'attempts' => 0,
            'max_attempts' => self::MAX_ATTEMPTS,
            'expires_at' => Carbon::now()->addMinutes(self::EXPIRATION_MINUTES),
        ]);

        // Dispatch OTP via SMS provider
        $sent = $this->smsManager->sendOtp($normalizedPhone, $rawOtp, $purpose);

        if (! $sent) {
            return [
                'success' => false,
                'message' => 'Failed to send SMS code. Please verify your phone number and try again.',
            ];
        }

        return [
            'success' => true,
            'message' => 'A 6-digit verification code has been sent to your phone.',
            'cooldown_remaining' => self::RESEND_COOLDOWN_SECONDS,
        ];
    }

    /**
     * Verify an OTP provided by a user.
     *
     * @return array{
     *     success: bool,
     *     message: string,
     *     record?: PhoneVerificationCode,
     *     exceeded?: bool
     * }
     */
    public function verifyOtp(string $phone, string $code, string $purpose = 'login'): array
    {
        $normalizedPhone = $this->normalizePhone($phone);
        $cleanCode = trim($code);

        if (strlen($cleanCode) !== self::OTP_LENGTH || ! ctype_digit($cleanCode)) {
            return [
                'success' => false,
                'message' => 'Please enter a valid 6-digit verification code.',
            ];
        }

        $record = PhoneVerificationCode::where('phone', $normalizedPhone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (! $record) {
            return [
                'success' => false,
                'message' => 'No active verification code found for this phone number. Please request a new code.',
            ];
        }

        if ($record->isExpired()) {
            return [
                'success' => false,
                'message' => 'The verification code has expired. Please request a new code.',
            ];
        }

        if ($record->hasExceededAttempts()) {
            return [
                'success' => false,
                'exceeded' => true,
                'message' => 'Maximum verification attempts exceeded. Please request a new code.',
            ];
        }

        // Verify the hashed code
        if (! Hash::check($cleanCode, $record->code_hash)) {
            $record->increment('attempts');

            $attemptsLeft = $record->max_attempts - $record->attempts;
            if ($attemptsLeft <= 0) {
                // Expire code immediately upon exceeding max attempts
                $record->update(['expires_at' => Carbon::now()]);

                return [
                    'success' => false,
                    'exceeded' => true,
                    'message' => 'Too many incorrect attempts. This code has been invalidated. Please request a new code.',
                ];
            }

            return [
                'success' => false,
                'message' => "Invalid code. {$attemptsLeft} attempt(s) remaining.",
            ];
        }

        // Mark as verified to prevent replay attacks
        $record->update([
            'verified_at' => Carbon::now(),
        ]);

        return [
            'success' => true,
            'message' => 'Phone number verified successfully.',
            'record' => $record,
        ];
    }
}
