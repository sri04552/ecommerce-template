<?php

namespace Tests\Feature;

use App\Facades\Setting;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Database\Seeders\DemoStoreSeeder;
use Database\Seeders\ProductionCleanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_production_clean_seeder_initializes_roles_settings_and_no_predictable_admin(): void
    {
        $this->seed(ProductionCleanSeeder::class);

        // Core roles exist
        $this->assertDatabaseHas('roles', ['name' => 'super_admin']);
        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('roles', ['name' => 'manager']);
        $this->assertDatabaseHas('roles', ['name' => 'customer']);

        // Shipping methods exist
        $this->assertDatabaseHas('shipping_methods', ['code' => 'standard']);
        $this->assertDatabaseHas('shipping_methods', ['code' => 'express']);

        // Settings exist
        $this->assertTrue(Setting::has('store_name'));
        $this->assertTrue(Setting::has('store_currency'));
        $this->assertTrue(Setting::has('active_theme'));

        // Zero demo catalog items
        $this->assertSame(0, Product::count());
        $this->assertSame(0, Category::count());

        // Strictly NO predictable default admin created
        $this->assertDatabaseMissing('users', ['email' => 'admin@example.com']);
        $this->assertDatabaseMissing('users', ['email' => 'admin@admin.com']);
    }

    public function test_demo_store_seeder_populates_realistic_catalog(): void
    {
        $this->seed(DemoStoreSeeder::class);

        $this->assertGreaterThan(0, Category::count());
        $this->assertGreaterThan(0, Brand::count());
        $this->assertGreaterThan(0, Product::count());

        // Verify products have variants and inventory
        $product = Product::with(['variants.inventoryLevel', 'category', 'brand'])->first();
        $this->assertNotNull($product);
        $this->assertNotEmpty($product->variants);
        $this->assertNotNull($product->variants->first()->inventoryLevel);
        $this->assertGreaterThanOrEqual(0, $product->variants->first()->inventoryLevel->quantity_on_hand);
    }
}
