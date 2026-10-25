<?php

namespace App\Services\Sms;

use App\Services\Sms\Contracts\SmsProviderInterface;
use App\Services\Sms\Providers\ArraySmsProvider;
use App\Services\Sms\Providers\LogSmsProvider;
use App\Services\Sms\Providers\TwilioSmsProvider;
use InvalidArgumentException;

class SmsManager
{
    protected ?SmsProviderInterface $customProvider = null;

    /**
     * @var array<string, SmsProviderInterface>
     */
    protected array $drivers = [];

    public function provider(?string $name = null): SmsProviderInterface
    {
        if ($this->customProvider !== null) {
            return $this->customProvider;
        }

        $name = $name ?: config('services.sms.default_provider', 'log');

        if (! isset($this->drivers[$name])) {
            $this->drivers[$name] = $this->createDriver($name);
        }

        return $this->drivers[$name];
    }

    public function swap(SmsProviderInterface $provider): void
    {
        $this->customProvider = $provider;
    }

    public function reset(): void
    {
        $this->customProvider = null;
        $this->drivers = [];
    }

    public function isConfigured(): bool
    {
        return $this->provider()->isConfigured();
    }

    public function sendOtp(string $phone, string $code, string $purpose): bool
    {
        return $this->provider()->sendOtp($phone, $code, $purpose);
    }

    protected function createDriver(string $name): SmsProviderInterface
    {
        return match ($name) {
            'twilio' => new TwilioSmsProvider,
            'log' => new LogSmsProvider,
            'array' => new ArraySmsProvider,
            default => throw new InvalidArgumentException("Unsupported SMS driver [{$name}]."),
        };
    }
}
