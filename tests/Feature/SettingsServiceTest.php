<?php

namespace Tests\Feature;

use App\Facades\Setting;
use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SettingsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Setting::clearCache();
    }

    public function test_can_set_and_get_typed_values(): void
    {
        Setting::set('store_title', 'My Custom Store', 'string');
        Setting::set('maintenance_mode', false, 'boolean');
        Setting::set('max_items_per_page', 24, 'integer');
        Setting::set('vat_rate', 18.5, 'float');
        Setting::set('supported_locales', ['en', 'fr', 'es'], 'json');

        $this->assertSame('My Custom Store', Setting::getString('store_title'));
        $this->assertFalse(Setting::getBool('maintenance_mode'));
        $this->assertSame(24, Setting::getInt('max_items_per_page'));
        $this->assertSame(18.5, Setting::getFloat('vat_rate'));
        $this->assertSame(['en', 'fr', 'es'], Setting::getArray('supported_locales'));
    }

    public function test_returns_fallback_default_when_key_does_not_exist(): void
    {
        $this->assertSame('Default Name', Setting::get('non_existent_key', 'Default Name'));
        $this->assertSame('fallback', Setting::getString('missing_string', 'fallback'));
        $this->assertTrue(Setting::getBool('missing_bool', true));
        $this->assertSame(99, Setting::getInt('missing_int', 99));
        $this->assertSame(12.34, Setting::getFloat('missing_float', 12.34));
        $this->assertSame(['a', 'b'], Setting::getArray('missing_array', ['a', 'b']));
    }

    public function test_caches_settings_and_clears_on_mutation(): void
    {
        Setting::set('cached_key', 'initial_value');

        // First call should populate cache
        $this->assertSame('initial_value', Setting::get('cached_key'));

        // Directly manipulate DB without service to verify cache is active
        StoreSetting::where('key', 'cached_key')->update(['value' => 'db_modified_value']);

        // Still returns cached value
        $this->assertSame('initial_value', Setting::get('cached_key'));

        // Mutating via service should invalidate cache
        Setting::set('cached_key', 'new_service_value');
        $this->assertSame('new_service_value', Setting::get('cached_key'));
    }

    public function test_returns_brand_design_tokens_with_fallbacks(): void
    {
        Setting::set('theme_primary_color', '#10b981');
        Setting::set('theme_border_radius', '0.75rem');

        $tokens = Setting::getThemeTokens();

        $this->assertIsArray($tokens);
        $this->assertSame('#10b981', $tokens['--brand-primary']);
        $this->assertSame('0.75rem', $tokens['--brand-radius']);
        $this->assertArrayHasKey('--brand-secondary', $tokens);
        $this->assertArrayHasKey('--brand-accent', $tokens);
        $this->assertArrayHasKey('--brand-surface', $tokens);
    }
}
