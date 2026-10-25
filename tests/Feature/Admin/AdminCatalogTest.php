<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\ProductionCleanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected User $customerUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductionCleanSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();
        $customerRole = Role::where('name', 'customer')->first();

        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);

        $this->customerUser = User::factory()->create();
        $this->customerUser->roles()->attach($customerRole);
    }

    public function test_guest_is_redirected_from_admin_products(): void
    {
        $response = $this->get('/admin/products');
        $response->assertRedirect('/login');
    }

    public function test_customer_receives_403_on_admin_products(): void
    {
        $response = $this->actingAs($this->customerUser)->get('/admin/products');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_product_listing(): void
    {
        Product::create([
            'name' => 'Sample Watch',
            'slug' => 'sample-watch',
            'sku' => 'WCH-01',
            'base_price' => 120.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->get('/admin/products');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Products/Index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Sample Watch')
        );
    }

    public function test_admin_can_create_product_with_default_variant_and_stock(): void
    {
        $category = Category::create([
            'name' => 'Accessories',
            'slug' => 'accessories',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->post('/admin/products', [
            'name' => 'Canvas Tote Bag',
            'sku' => 'BAG-TOT-01',
            'category_id' => $category->id,
            'base_price' => 24.50,
            'sale_price' => 19.99,
            'initial_stock' => 25,
            'allow_backorder' => false,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $response->assertRedirect('/admin/products');
        $response->assertSessionHas('success');

        $product = Product::where('sku', 'BAG-TOT-01')->first();
        $this->assertNotNull($product);
        $this->assertEquals('canvas-tote-bag', $product->slug);
        $this->assertTrue($product->is_featured);

        // Assert default variant was created
        $defaultVariant = $product->variants()->first();
        $this->assertNotNull($defaultVariant);
        $this->assertEquals('BAG-TOT-01', $defaultVariant->sku);
        $this->assertEquals(24.50, $defaultVariant->price);

        // Assert inventory level and transaction were recorded
        $inventory = $defaultVariant->inventoryLevel;
        $this->assertNotNull($inventory);
        $this->assertEquals(25, $inventory->quantity_on_hand);
    }

    public function test_admin_can_update_product(): void
    {
        $product = Product::create([
            'name' => 'Original Name',
            'slug' => 'original-name',
            'sku' => 'ORIG-01',
            'base_price' => 10.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->put("/admin/products/{$product->id}", [
            'name' => 'Updated Product Name',
            'sku' => 'ORIG-01-UPD',
            'base_price' => 15.00,
            'sale_price' => 12.00,
            'is_active' => true,
            'is_featured' => false,
        ]);

        $response->assertRedirect('/admin/products');

        $product->refresh();
        $this->assertEquals('Updated Product Name', $product->name);
        $this->assertEquals('ORIG-01-UPD', $product->sku);
        $this->assertEquals(15.00, $product->base_price);
        $this->assertEquals(12.00, $product->sale_price);
    }

    public function test_admin_can_toggle_product_status(): void
    {
        $product = Product::create([
            'name' => 'Toggle Me',
            'slug' => 'toggle-me',
            'sku' => 'TGL-01',
            'base_price' => 20.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)
            ->post("/admin/products/{$product->id}/toggle-status");

        $response->assertRedirect();
        $product->refresh();
        $this->assertFalse($product->is_active);

        // Toggle back
        $this->actingAs($this->adminUser)
            ->post("/admin/products/{$product->id}/toggle-status");

        $product->refresh();
        $this->assertTrue($product->is_active);
    }

    public function test_admin_can_delete_unreferenced_product(): void
    {
        $product = Product::create([
            'name' => 'Delete Me',
            'slug' => 'delete-me',
            'sku' => 'DEL-01',
            'base_price' => 20.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->delete("/admin/products/{$product->id}");

        $response->assertRedirect('/admin/products');
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_admin_cannot_delete_product_referenced_by_orders(): void
    {
        $product = Product::create([
            'name' => 'Ordered Product',
            'slug' => 'ordered-product',
            'sku' => 'ORD-01',
            'base_price' => 50.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'ORD-01',
            'title' => 'Default',
            'price' => 50.00,
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-2026-0001',
            'customer_email' => 'buyer@example.com',
            'status' => 'completed',
            'currency' => 'USD',
            'subtotal' => 50.00,
            'shipping_total' => 0.00,
            'tax_total' => 0.00,
            'discount_total' => 0.00,
            'grand_total' => 50.00,
            'shipping_address_snapshot' => ['address1' => '123 Test St', 'city' => 'Anytown'],
            'billing_address_snapshot' => ['address1' => '123 Test St', 'city' => 'Anytown'],
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name_snapshot' => $product->name,
            'sku_snapshot' => $product->sku,
            'unit_price' => 50.00,
            'quantity' => 1,
            'subtotal' => 50.00,
            'total' => 50.00,
        ]);

        $response = $this->actingAs($this->adminUser)->delete("/admin/products/{$product->id}");

        $response->assertRedirect('/admin/products');
        $response->assertSessionHas('error');

        // Product should still exist and be deactivated instead
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_active' => false,
        ]);
    }
}
