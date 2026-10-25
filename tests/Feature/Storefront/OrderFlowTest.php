<?php

namespace Tests\Feature\Storefront;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Database\Seeders\ProductionCleanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductionCleanSeeder::class);
        Mail::fake();
    }

    protected function createTestProduct(array $attributes = []): Product
    {
        $category = Category::firstOrCreate(
            ['slug' => 'apparel'],
            ['name' => 'Apparel', 'is_active' => true]
        );

        $sku = 'SKU-'.uniqid();
        $product = Product::create(array_merge([
            'category_id' => $category->id,
            'name' => 'Cotton Linen Shirt',
            'slug' => 'cotton-linen-shirt-'.uniqid(),
            'sku' => $sku,
            'base_price' => 999.00,
            'is_active' => true,
            'cod_available' => true,
            'delivery_fee' => 0,
            'has_return_exchange' => true,
            'return_window_days' => 7,
        ], $attributes));

        ProductVariant::create([
            'product_id' => $product->id,
            'sku' => $sku.'-V',
            'price' => $product->base_price,
            'is_active' => true,
        ]);

        return $product;
    }

    public function test_customer_can_place_order_with_cod(): void
    {
        $product = $this->createTestProduct([
            'cod_available' => true,
            'delivery_fee' => 0,
        ]);
        $variant = $product->variants()->first();

        $payload = [
            'customer_name' => 'Rahul Sharma',
            'customer_email' => 'rahul@example.com',
            'customer_phone' => '9876543210',
            'street_address' => 'Flat 402, Lotus Apartments',
            'city' => 'Hyderabad',
            'state' => 'Telangana',
            'postal_code' => '500081',
            'payment_method' => 'cod',
            'cart_items' => [
                [
                    'productId' => $product->id,
                    'variantId' => $variant->id,
                    'name' => $product->name,
                    'price' => 999.00,
                    'quantity' => 2,
                    'deliveryFee' => 0,
                ],
            ],
        ];

        $response = $this->postJson('/checkout/place-order', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('orders', [
            'customer_email' => 'rahul@example.com',
            'payment_method' => 'cod',
        ]);
    }

    public function test_order_rejects_cod_if_product_is_prepaid_only(): void
    {
        $product = $this->createTestProduct([
            'cod_available' => false,
        ]);

        $payload = [
            'customer_name' => 'Ananya Roy',
            'customer_email' => 'ananya@example.com',
            'customer_phone' => '9876543211',
            'street_address' => 'Salt Lake Sector 5',
            'city' => 'Kolkata',
            'state' => 'West Bengal',
            'postal_code' => '700091',
            'payment_method' => 'cod',
            'cart_items' => [
                [
                    'productId' => $product->id,
                    'variantId' => null,
                    'name' => $product->name,
                    'price' => 1299.00,
                    'quantity' => 1,
                    'deliveryFee' => 50,
                ],
            ],
        ];

        $response = $this->postJson('/checkout/place-order', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_tracking_page_renders_order(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TEST-123456',
            'customer_email' => 'test@example.com',
            'customer_phone' => '9876543210',
            'status' => 'confirmed',
            'payment_method' => 'cod',
            'currency' => 'INR',
            'subtotal' => 999.00,
            'discount_total' => 0,
            'shipping_total' => 0,
            'tax_total' => 0,
            'grand_total' => 999.00,
            'shipping_address_snapshot' => [
                'name' => 'Test Customer',
                'street' => 'MG Road',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'postal_code' => '560001',
            ],
            'billing_address_snapshot' => [
                'street' => 'MG Road',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'postal_code' => '560001',
            ],
        ]);

        $response = $this->get('/track?order_number=ORD-TEST-123456');

        $response->assertStatus(200);
    }

    public function test_customer_can_submit_review_with_photos(): void
    {
        $product = $this->createTestProduct();

        $payload = [
            'author_name' => 'Vikram Patel',
            'rating' => 5,
            'title' => 'Outstanding Quality',
            'comment' => 'The fabric and fit exceeded all expectations. Fast delivery too!',
            'photos' => ['data:image/webp;base64,mockpreview123'],
        ];

        $response = $this->postJson("/products/{$product->id}/reviews", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('product_reviews', [
            'product_id' => $product->id,
            'rating' => 5,
            'author_name' => 'Vikram Patel',
        ]);
    }

    public function test_customer_can_request_return_with_upi(): void
    {
        $product = $this->createTestProduct([
            'has_return_exchange' => true,
        ]);
        $variant = $product->variants()->first();

        $order = Order::create([
            'order_number' => 'ORD-RET-998877',
            'customer_email' => 'return@example.com',
            'customer_phone' => '9876543210',
            'status' => 'delivered',
            'payment_method' => 'cod',
            'currency' => 'INR',
            'subtotal' => 999.00,
            'discount_total' => 0,
            'shipping_total' => 0,
            'tax_total' => 0,
            'grand_total' => 999.00,
            'shipping_address_snapshot' => [
                'name' => 'Vikram Patel',
                'street' => 'Park Street',
                'city' => 'Kolkata',
                'state' => 'West Bengal',
                'postal_code' => '700016',
            ],
            'billing_address_snapshot' => [
                'street' => 'Park Street',
                'city' => 'Kolkata',
                'state' => 'West Bengal',
                'postal_code' => '700016',
            ],
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name_snapshot' => $product->name,
            'sku_snapshot' => $variant->sku,
            'unit_price' => 999.00,
            'quantity' => 1,
            'subtotal' => 999.00,
            'tax_amount' => 0,
            'total' => 999.00,
        ]);

        $payload = [
            'order_item_id' => $item->id,
            'type' => 'return',
            'reason' => 'Size too large',
            'refund_method' => 'upi',
            'upi_id' => 'vikram@okhdfcbank',
        ];

        $response = $this->postJson("/orders/{$order->id}/request-return", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('order_returns', [
            'order_id' => $order->id,
            'refund_method' => 'upi',
        ]);
    }
}
