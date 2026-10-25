<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\Contracts\SmsProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioSmsProvider implements SmsProviderInterface
{
    protected ?string $sid;

    protected ?string $token;

    protected ?string $from;

    public function __construct()
    {
        $this->sid = config('services.sms.twilio.sid');
        $this->token = config('services.sms.twilio.auth_token');
        $this->from = config('services.sms.twilio.from');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->sid) && ! empty($this->token) && ! empty($this->from);
    }

    public function getName(): string
    {
        return 'twilio';
    }

    public function sendOtp(string $phone, string $code, string $purpose): bool
    {
        if (! $this->isConfigured()) {
            Log::warning('Twilio SMS requested but credentials are not configured');

            return false;
        }

        $storeName = config('ecommerce.store_name', 'Store');
        $message = match ($purpose) {
            'login' => "Your {$storeName} login code is: {$code}. Valid for 5 minutes.",
            'phone_update' => "Your {$storeName} phone verification code is: {$code}. Valid for 5 minutes.",
            default => "Your {$storeName} verification code is: {$code}. Valid for 5 minutes.",
        };

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->sid, $this->token)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json", [
                    'From' => $this->from,
                    'To' => $phone,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Twilio SMS delivery failed', [
                'status' => $response->status(),
                'error_code' => $response->json('code'),
                'message' => $response->json('message'),
            ]);

            return false;
        } catch (\Throwable $e) {
            Log::error('Twilio SMS exception: '.$e->getMessage());

            return false;
        }
    }
}
