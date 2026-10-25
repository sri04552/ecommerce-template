<?php

namespace Tests\Feature\Catalog;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\ProductionCleanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StorefrontCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductionCleanSeeder::class);
    }

    public function test_storefront_home_renders_successfully(): void
    {
        $category = Category::create([
            'name' => 'Home Decor',
            'slug' => 'home-decor',
            'is_active' => true,
        ]);

        $product = Product::create([
            'name' => 'Minimalist Lamp',
            'slug' => 'minimalist-lamp',
            'sku' => 'LAMP-01',
            'category_id' => $category->id,
            'base_price' => 49.99,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('featuredProducts')
            ->has('categories')
            ->where('featuredProducts.0.name', 'Minimalist Lamp')
        );
    }

    public function test_catalog_index_lists_active_products(): void
    {
        $activeProduct = Product::create([
            'name' => 'Ceramic Mug',
            'slug' => 'ceramic-mug',
            'sku' => 'MUG-01',
            'base_price' => 18.00,
            'is_active' => true,
        ]);

        $draftProduct = Product::create([
            'name' => 'Secret Concept Item',
            'slug' => 'secret-concept',
            'sku' => 'SEC-01',
            'base_price' => 999.00,
            'is_active' => false,
        ]);

        $response = $this->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/Index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Ceramic Mug')
        );
    }

    public function test_catalog_search_filters_products_by_title_or_sku(): void
    {
        Product::create([
            'name' => 'Leather Wallet',
            'slug' => 'leather-wallet',
            'sku' => 'WLT-LTH-01',
            'base_price' => 35.00,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Canvas Backpack',
            'slug' => 'canvas-backpack',
            'sku' => 'BPK-CNV-02',
            'base_price' => 75.00,
            'is_active' => true,
        ]);

        $response = $this->get('/products?search=Wallet');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/Index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Leather Wallet')
        );
    }

    public function test_storefront_product_detail_page_renders(): void
    {
        $product = Product::create([
            'name' => 'Desk Mat',
            'slug' => 'desk-mat',
            'sku' => 'MAT-01',
            'base_price' => 29.99,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'MAT-01-GRY',
            'title' => 'Slate Grey',
            'price' => 29.99,
            'is_active' => true,
        ]);

        $response = $this->get('/products/desk-mat');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/Show')
            ->where('product.name', 'Desk Mat')
            ->has('product.variants')
        );
    }

    public function test_inactive_product_returns_404_on_storefront(): void
    {
        Product::create([
            'name' => 'Draft Product',
            'slug' => 'draft-product',
            'sku' => 'DFT-01',
            'base_price' => 50.00,
            'is_active' => false,
        ]);

        $response = $this->get('/products/draft-product');

        $response->assertStatus(404);
    }

    public function test_category_show_page_displays_filtered_products(): void
    {
        $category = Category::create([
            'name' => 'Apparel',
            'slug' => 'apparel',
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Cotton Hoodie',
            'slug' => 'cotton-hoodie',
            'sku' => 'HD-01',
            'category_id' => $category->id,
            'base_price' => 60.00,
            'is_active' => true,
        ]);

        $response = $this->get('/categories/apparel');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Catalog/Category')
            ->where('category.name', 'Apparel')
            ->has('products.data', 1)
        );
    }

    public function test_cart_page_renders_with_inertia(): void
    {
        $response = $this->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Cart/Index')
        );
    }
}
