<?php

namespace App\Facades;

use App\Services\SettingsService;
use Illuminate\Support\Facades\Facade;

/**
 * @method static mixed get(string $key, mixed $default = null)
 * @method static string getString(string $key, string $default = '')
 * @method static bool getBool(string $key, bool $default = false)
 * @method static int getInt(string $key, int $default = 0)
 * @method static float getFloat(string $key, float $default = 0.0)
 * @method static array getArray(string $key, array $default = [])
 * @method static bool has(string $key)
 * @method static \App\Models\StoreSetting set(string $key, mixed $value, ?string $type = null, string $group = 'general')
 * @method static void setMany(array $settings, string $group = 'general')
 * @method static array all(?string $group = null)
 * @method static array getThemeTokens()
 * @method static void clearCache()
 *
 * @see SettingsService
 */
class Setting extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SettingsService::class;
    }
}
