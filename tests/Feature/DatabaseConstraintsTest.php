<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseConstraintsTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_create_duplicate_category_slug(): void
    {
        Category::create(['name' => 'Fashion', 'slug' => 'fashion']);

        $this->expectException(QueryException::class);
        Category::create(['name' => 'Fashion Second', 'slug' => 'fashion']);
    }

    public function test_cannot_create_duplicate_product_sku(): void
    {
        $cat = Category::create(['name' => 'Gear', 'slug' => 'gear']);
        Product::create(['category_id' => $cat->id, 'name' => 'Bag', 'slug' => 'bag-1', 'sku' => 'BAG-01', 'base_price' => 50]);

        $this->expectException(QueryException::class);
        Product::create(['category_id' => $cat->id, 'name' => 'Bag 2', 'slug' => 'bag-2', 'sku' => 'BAG-01', 'base_price' => 60]);
    }

    public function test_deleting_user_preserves_historical_order_with_null_user_id(): void
    {
        $user = User::create([
            'name' => 'Temporary User',
            'email' => 'temp@example.com',
            'password' => 'secret123',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-HIST-001',
            'user_id' => $user->id,
            'customer_email' => 'temp@example.com',
            'status' => 'delivered',
            'currency' => 'USD',
            'subtotal' => 50.00,
            'grand_total' => 50.00,
            'shipping_address_snapshot' => ['city' => 'Denver'],
            'billing_address_snapshot' => ['city' => 'Denver'],
        ]);

        $this->assertSame($user->id, $order->user_id);

        // Delete user
        $user->delete();

        // Order record still exists, but user_id is set to null (non-destructive)
        $order->refresh();
        $this->assertNull($order->user_id);
        $this->assertSame('temp@example.com', $order->customer_email);
    }

    public function test_deleting_product_variant_preserves_order_item_snapshot(): void
    {
        $cat = Category::create(['name' => 'Tech', 'slug' => 'tech']);
        $product = Product::create([
            'category_id' => $cat->id,
            'name' => 'USB Cable',
            'slug' => 'usb-cable',
            'sku' => 'USB-C-01',
            'base_price' => 15.00,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'USB-C-01-2M',
            'title' => '2 Meter',
            'price' => 15.00,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-SNAP-001',
            'customer_email' => 'shopper@example.com',
            'status' => 'confirmed',
            'currency' => 'USD',
            'subtotal' => 15.00,
            'grand_total' => 15.00,
            'shipping_address_snapshot' => ['city' => 'Miami'],
            'billing_address_snapshot' => ['city' => 'Miami'],
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name_snapshot' => 'USB Cable',
            'variant_title_snapshot' => '2 Meter',
            'sku_snapshot' => 'USB-C-01-2M',
            'unit_price' => 15.00,
            'quantity' => 1,
            'subtotal' => 15.00,
            'total' => 15.00,
        ]);

        // Delete the catalog variant
        $variant->delete();

        // The order item must be preserved with intact snapshots and product_variant_id set to null
        $orderItem->refresh();
        $this->assertNull($orderItem->product_variant_id);
        $this->assertSame('USB Cable', $orderItem->product_name_snapshot);
        $this->assertSame('USB-C-01-2M', $orderItem->sku_snapshot);
        $this->assertEquals(15.00, $orderItem->total);
    }

    public function test_cannot_add_duplicate_variant_to_same_cart(): void
    {
        $cat = Category::create(['name' => 'Stationery', 'slug' => 'stationery']);
        $product = Product::create([
            'category_id' => $cat->id,
            'name' => 'Notebook',
            'slug' => 'notebook',
            'sku' => 'NB-01',
            'base_price' => 8.00,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'NB-01-A5',
            'title' => 'A5 Ruled',
            'price' => 8.00,
        ]);

        $cart = Cart::create(['currency' => 'USD']);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
            'unit_price' => 8.00,
        ]);

        // Inserting the same variant into the same cart must violate unique constraint
        $this->expectException(QueryException::class);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
            'unit_price' => 8.00,
        ]);
    }
}
