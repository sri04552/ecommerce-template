<?php

namespace App\Services\Sms\Providers;

use App\Services\Sms\Contracts\SmsProviderInterface;

class ArraySmsProvider implements SmsProviderInterface
{
    /**
     * @var list<array{phone: string, code: string, purpose: string, timestamp: int}>
     */
    protected array $messages = [];

    protected bool $shouldFail = false;

    public function sendOtp(string $phone, string $code, string $purpose): bool
    {
        if ($this->shouldFail) {
            return false;
        }

        $this->messages[] = [
            'phone' => $phone,
            'code' => $code,
            'purpose' => $purpose,
            'timestamp' => time(),
        ];

        return true;
    }

    public function isConfigured(): bool
    {
        return true;
    }

    public function getName(): string
    {
        return 'array';
    }

    public function setShouldFail(bool $shouldFail): void
    {
        $this->shouldFail = $shouldFail;
    }

    /**
     * @return list<array{phone: string, code: string, purpose: string, timestamp: int}>
     */
    public function getSentMessages(): array
    {
        return $this->messages;
    }

    public function hasSentTo(string $phone): bool
    {
        foreach ($this->messages as $msg) {
            if ($msg['phone'] === $phone) {
                return true;
            }
        }

        return false;
    }

    public function latestCodeFor(string $phone): ?string
    {
        for ($i = count($this->messages) - 1; $i >= 0; $i--) {
            if ($this->messages[$i]['phone'] === $phone) {
                return $this->messages[$i]['code'];
            }
        }

        return null;
    }

    public function clear(): void
    {
        $this->messages = [];
        $this->shouldFail = false;
    }
}
