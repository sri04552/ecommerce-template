<?php

namespace App\Services;

use App\Models\StoreSetting;
use Illuminate\Support\Facades\Cache;

class SettingsService
{
    /**
     * Cache key prefix for store settings.
     */
    protected const CACHE_KEY = 'app_store_settings_all';

    /**
     * Cache TTL in seconds (24 hours).
     */
    protected const CACHE_TTL = 86400;

    /**
     * In-memory cache for the current request cycle.
     */
    protected ?array $memoryCache = null;

    /**
     * Retrieve a typed setting value by key with optional fallback.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        $settings = $this->loadAll();

        if (array_key_exists($key, $settings)) {
            return $settings[$key]['value'];
        }

        return $default;
    }

    /**
     * Retrieve a string setting value.
     */
    public function getString(string $key, string $default = ''): string
    {
        $val = $this->get($key, $default);

        return is_string($val) ? $val : (string) $val;
    }

    /**
     * Retrieve a boolean setting value.
     */
    public function getBool(string $key, bool $default = false): bool
    {
        return (bool) $this->get($key, $default);
    }

    /**
     * Retrieve an integer setting value.
     */
    public function getInt(string $key, int $default = 0): int
    {
        return (int) $this->get($key, $default);
    }

    /**
     * Retrieve a float setting value.
     */
    public function getFloat(string $key, float $default = 0.0): float
    {
        return (float) $this->get($key, $default);
    }

    /**
     * Retrieve an array / JSON setting value.
     */
    public function getArray(string $key, array $default = []): array
    {
        $val = $this->get($key, $default);

        return is_array($val) ? $val : $default;
    }

    /**
     * Check if a setting key exists.
     */
    public function has(string $key): bool
    {
        $settings = $this->loadAll();

        return array_key_exists($key, $settings);
    }

    /**
     * Set and persist a setting value.
     */
    public function set(string $key, mixed $value, ?string $type = null, string $group = 'general'): StoreSetting
    {
        $serialized = StoreSetting::serializeValue($value, $type);

        $setting = StoreSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $serialized,
                'type' => $type,
                'group' => $group,
            ]
        );

        $this->clearCache();

        return $setting;
    }

    /**
     * Set multiple settings in a single batch.
     */
    public function setMany(array $settings, string $group = 'general'): void
    {
        foreach ($settings as $key => $value) {
            $type = null;
            $serialized = StoreSetting::serializeValue($value, $type);

            StoreSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $serialized,
                    'type' => $type,
                    'group' => $group,
                ]
            );
        }

        $this->clearCache();
    }

    /**
     * Retrieve all settings optionally filtered by group.
     */
    public function all(?string $group = null): array
    {
        $settings = $this->loadAll();

        if ($group === null) {
            return array_map(fn ($item) => $item['value'], $settings);
        }

        $filtered = [];
        foreach ($settings as $key => $item) {
            if ($item['group'] === $group) {
                $filtered[$key] = $item['value'];
            }
        }

        return $filtered;
    }

    /**
     * Retrieve resolved CSS design token dictionary for brand theming.
     */
    public function getThemeTokens(): array
    {
        $defaults = config('ecommerce.theme', []);

        $primary = $this->getString('theme_primary_color', $defaults['primary_color'] ?? '#C2185B');
        if (in_array(strtolower($primary), ['#2563eb', '#1d4ed8', '#3b82f6', '#4f46e5', 'blue'])) {
            $primary = '#C2185B';
        }

        $primaryHover = $this->getString('theme_primary_hover', $defaults['primary_hover'] ?? '#880E4F');
        if (in_array(strtolower($primaryHover), ['#1d4ed8', '#1e40af', '#4338ca'])) {
            $primaryHover = '#880E4F';
        }

        $secondary = $this->getString('theme_secondary_color', $defaults['secondary_color'] ?? '#880E4F');
        if (in_array(strtolower($secondary), ['#0f172a', '#1e293b', '#312e81', 'slate'])) {
            $secondary = '#880E4F';
        }

        $accent = $this->getString('theme_accent_color', $defaults['accent_color'] ?? '#E91E63');
        if (in_array(strtolower($accent), ['#f59e0b', '#d97706', '#fbbf24'])) {
            $accent = '#E91E63';
        }

        $radius = $this->getString('theme_border_radius', $defaults['border_radius'] ?? '0.75rem');
        if ($radius === '0.5rem') {
            $radius = '0.75rem';
        }

        return [
            '--brand-primary' => $primary,
            '--brand-primary-hover' => $primaryHover,
            '--brand-secondary' => $secondary,
            '--brand-accent' => $accent,
            '--brand-surface' => '#FFFFFF',
            '--brand-surface-muted' => '#FFF1F6',
            '--brand-surface-accent' => '#FCE4EC',
            '--brand-text' => '#19121B',
            '--brand-text-muted' => '#6B5B66',
            '--brand-border' => 'rgba(240, 220, 229, 0.5)',
            '--brand-radius' => $radius,
        ];
    }

    /**
     * Invalidate cached settings.
     */
    public function clearCache(): void
    {
        $this->memoryCache = null;
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Load all settings from persistent cache or database.
     */
    protected function loadAll(): array
    {
        if ($this->memoryCache !== null) {
            return $this->memoryCache;
        }

        $this->memoryCache = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            try {
                $records = StoreSetting::all();
                $data = [];

                foreach ($records as $record) {
                    $data[$record->key] = [
                        'value' => $record->typed_value,
                        'type' => $record->type,
                        'group' => $record->group,
                    ];
                }

                return $data;
            } catch (\Throwable) {
                return [];
            }
        });

        return $this->memoryCache;
    }
}
