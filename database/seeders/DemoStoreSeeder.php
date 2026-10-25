<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\InventoryLevel;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Promotion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoStoreSeeder extends Seeder
{
    /**
     * Run the demo store catalog seed.
     * Populates realistic demonstration products, categories, variants, and banners.
     */
    public function run(): void
    {
        // First ensure clean baseline is seeded
        $this->call(ProductionCleanSeeder::class);

        DB::transaction(function () {
            // 1. Demo Categories
            $electronics = Category::firstOrCreate(['slug' => 'electronics'], [
                'name' => 'Electronics',
                'description' => 'Modern gadgets, audio equipment, and wearable technology.',
                'is_active' => true,
                'sort_order' => 1,
            ]);

            $audio = Category::firstOrCreate(['slug' => 'audio'], [
                'parent_id' => $electronics->id,
                'name' => 'Audio & Headphones',
                'description' => 'Premium noise-cancelling headphones and wireless earbuds.',
                'is_active' => true,
                'sort_order' => 1,
            ]);

            $wearables = Category::firstOrCreate(['slug' => 'wearables'], [
                'parent_id' => $electronics->id,
                'name' => 'Smart Wearables',
                'description' => 'Fitness smartwatches and health trackers.',
                'is_active' => true,
                'sort_order' => 2,
            ]);

            $fashion = Category::firstOrCreate(['slug' => 'fashion'], [
                'name' => 'Apparel & Fashion',
                'description' => 'Contemporary minimalist clothing and everyday essentials.',
                'is_active' => true,
                'sort_order' => 2,
            ]);

            $home = Category::firstOrCreate(['slug' => 'home-living'], [
                'name' => 'Home & Living',
                'description' => 'Minimalist decor, lighting, and workspace accessories.',
                'is_active' => true,
                'sort_order' => 3,
            ]);

            // 2. Demo Brands
            $auraTech = Brand::firstOrCreate(['slug' => 'auratech'], [
                'name' => 'AuraTech',
                'website_url' => 'https://example.com/auratech',
                'is_active' => true,
            ]);

            $luxeWear = Brand::firstOrCreate(['slug' => 'luxewear'], [
                'name' => 'LuxeWear',
                'website_url' => 'https://example.com/luxewear',
                'is_active' => true,
            ]);

            $urbanLiving = Brand::firstOrCreate(['slug' => 'urbanliving'], [
                'name' => 'UrbanLiving',
                'website_url' => 'https://example.com/urbanliving',
                'is_active' => true,
            ]);

            // 3. Demo Products
            // Product 1: Wireless Headphones (Has Variants: Black, Silver)
            $headphones = Product::firstOrCreate(['sku' => 'AUR-HP-001'], [
                'category_id' => $audio->id,
                'brand_id' => $auraTech->id,
                'name' => 'Aura Pro Wireless ANC Headphones',
                'slug' => 'aura-pro-wireless-anc-headphones',
                'short_description' => 'Active noise cancellation with 40-hour battery life and spatial audio.',
                'description' => '<p>Engineered for audiophiles. Features custom 40mm drivers, multi-point Bluetooth 5.4, and ultra-soft memory foam earcups.</p>',
                'base_price' => 14999.00,
                'sale_price' => 12499.00,
                'cost_price' => 6500.00,
                'has_variants' => true,
                'is_featured' => true,
                'is_active' => true,
            ]);

            $hpBlack = ProductVariant::firstOrCreate(['sku' => 'AUR-HP-001-BLK'], [
                'product_id' => $headphones->id,
                'title' => 'Matte Black',
                'price' => 12499.00,
                'sale_price' => null,
                'weight_grams' => 280,
                'attributes' => ['color' => 'Matte Black'],
                'is_active' => true,
            ]);

            $hpSilver = ProductVariant::firstOrCreate(['sku' => 'AUR-HP-001-SLV'], [
                'product_id' => $headphones->id,
                'title' => 'Arctic Silver',
                'price' => 12499.00,
                'sale_price' => null,
                'weight_grams' => 280,
                'attributes' => ['color' => 'Arctic Silver'],
                'is_active' => true,
            ]);

            ProductImage::firstOrCreate(['image_path' => '/demo/headphones-black.jpg'], [
                'product_id' => $headphones->id,
                'product_variant_id' => $hpBlack->id,
                'alt_text' => 'Aura Pro Headphones in Matte Black',
                'is_primary' => true,
                'sort_order' => 1,
            ]);

            InventoryLevel::updateOrCreate(
                ['product_variant_id' => $hpBlack->id],
                ['quantity_on_hand' => 50, 'reserved_quantity' => 2, 'safety_threshold' => 10]
            );

            InventoryLevel::updateOrCreate(
                ['product_variant_id' => $hpSilver->id],
                ['quantity_on_hand' => 35, 'reserved_quantity' => 0, 'safety_threshold' => 5]
            );

            // Product 2: Organic Cotton Tee (Has Variants: S, M, L, XL)
            $tee = Product::firstOrCreate(['sku' => 'LUX-TEE-001'], [
                'category_id' => $fashion->id,
                'brand_id' => $luxeWear->id,
                'name' => 'Organic Heavyweight Crewneck Tee',
                'slug' => 'organic-heavyweight-crewneck-tee',
                'short_description' => '240 GSM pre-shrunk combed organic cotton with tailored fit.',
                'description' => '<p>Crafted from 100% GOTS-certified organic cotton for breathable durability.</p>',
                'base_price' => 1299.00,
                'sale_price' => null,
                'cost_price' => 450.00,
                'has_variants' => true,
                'is_featured' => true,
                'is_active' => true,
            ]);

            foreach (['S', 'M', 'L', 'XL'] as $size) {
                $variant = ProductVariant::firstOrCreate(['sku' => "LUX-TEE-001-{$size}"], [
                    'product_id' => $tee->id,
                    'title' => "Size {$size}",
                    'price' => 1299.00,
                    'weight_grams' => 220,
                    'attributes' => ['size' => $size, 'material' => 'Organic Cotton'],
                    'is_active' => true,
                ]);

                InventoryLevel::updateOrCreate(
                    ['product_variant_id' => $variant->id],
                    ['quantity_on_hand' => 25, 'reserved_quantity' => 1, 'safety_threshold' => 5]
                );
            }

            // Product 3: Minimalist Desk Lamp (Single Product)
            $lamp = Product::firstOrCreate(['sku' => 'URB-LMP-001'], [
                'category_id' => $home->id,
                'brand_id' => $urbanLiving->id,
                'name' => 'Nordic Minimalist LED Desk Lamp',
                'slug' => 'nordic-minimalist-led-desk-lamp',
                'short_description' => 'Touch-dimmable warm LED with integrated 15W wireless phone charger.',
                'description' => '<p>Architectural aluminum body with precision diffused warm light.</p>',
                'base_price' => 2999.00,
                'sale_price' => 2499.00,
                'cost_price' => 1100.00,
                'has_variants' => false,
                'is_featured' => false,
                'is_active' => true,
            ]);

            $lampVariant = ProductVariant::firstOrCreate(['sku' => 'URB-LMP-001-DEF'], [
                'product_id' => $lamp->id,
                'title' => 'Default',
                'price' => 2499.00,
                'weight_grams' => 850,
                'is_active' => true,
            ]);

            InventoryLevel::updateOrCreate(
                ['product_variant_id' => $lampVariant->id],
                ['quantity_on_hand' => 18, 'reserved_quantity' => 0, 'safety_threshold' => 3]
            );

            // 4. Demo Promotions
            Promotion::firstOrCreate(['coupon_code' => 'WELCOME10'], [
                'title' => 'New Customer 10% Discount',
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'minimum_order_amount' => 999.00,
                'max_discount_amount' => 500.00,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ]);

            Promotion::firstOrCreate(['coupon_code' => 'FLAT500'], [
                'title' => 'Flat ₹500 Off Orders Above ₹2,999',
                'discount_type' => 'fixed_amount',
                'discount_value' => 500.00,
                'minimum_order_amount' => 2999.00,
                'usage_limit_per_user' => 1,
                'is_active' => true,
            ]);

            // 5. Demo Banners
            Banner::firstOrCreate(['placement' => 'home_hero'], [
                'title' => 'Minimalist Design Meets Modern Audio',
                'subtitle' => 'Explore the Aura Pro Wireless Collection',
                'image_path' => '/demo/banners/hero-audio.jpg',
                'target_url' => '/catalog/audio',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            Banner::firstOrCreate(['placement' => 'home_sub'], [
                'title' => 'Curated Everyday Apparel',
                'subtitle' => 'Sustainable GOTS certified organic materials',
                'image_path' => '/demo/banners/sub-apparel.jpg',
                'target_url' => '/catalog/fashion',
                'sort_order' => 2,
                'is_active' => true,
            ]);
        });
    }
}
