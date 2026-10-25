<?php

namespace Tests\Unit;

use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\CustomerAddress;
use App\Models\CustomerProfile;
use App\Models\InventoryLevel;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelRelationshipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_and_role_and_profile_relationships(): void
    {
        $user = User::create([
            'name' => 'Alice Doe',
            'email' => 'alice@example.com',
            'phone' => '+15551234567',
            'password' => 'secret123',
        ]);

        $role = Role::create([
            'name' => 'manager',
            'display_name' => 'Store Manager',
        ]);

        $user->roles()->attach($role);

        $profile = CustomerProfile::create([
            'user_id' => $user->id,
            'gender' => 'female',
            'preferences' => ['newsletter' => true],
        ]);

        $address = CustomerAddress::create([
            'user_id' => $user->id,
            'recipient_name' => 'Alice Doe',
            'phone' => '+15551234567',
            'address_line1' => '123 Market St',
            'city' => 'Austin',
            'state' => 'TX',
            'postal_code' => '78701',
            'country_code' => 'US',
            'is_default' => true,
        ]);

        $this->assertTrue($user->hasRole('manager'));
        $this->assertSame($profile->id, $user->customerProfile->id);
        $this->assertCount(1, $user->customerAddresses);
        $this->assertSame('Austin', $user->customerAddresses->first()->city);
    }

    public function test_catalog_category_brand_product_variant_image_relationships(): void
    {
        $parentCategory = Category::create([
            'name' => 'Apparel',
            'slug' => 'apparel',
        ]);

        $subCategory = Category::create([
            'parent_id' => $parentCategory->id,
            'name' => 'Footwear',
            'slug' => 'footwear',
        ]);

        $brand = Brand::create([
            'name' => 'RunFast',
            'slug' => 'runfast',
        ]);

        $product = Product::create([
            'category_id' => $subCategory->id,
            'brand_id' => $brand->id,
            'name' => 'Aero Runner 2',
            'slug' => 'aero-runner-2',
            'sku' => 'AERO-002',
            'base_price' => 129.99,
            'has_variants' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'AERO-002-10',
            'title' => 'Size 10',
            'price' => 129.99,
        ]);

        $image = ProductImage::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'image_path' => '/img/aero.jpg',
            'is_primary' => true,
        ]);

        $inv = InventoryLevel::create([
            'product_variant_id' => $variant->id,
            'quantity_on_hand' => 20,
            'reserved_quantity' => 2,
        ]);

        $this->assertSame($parentCategory->id, $subCategory->parent->id);
        $this->assertCount(1, $parentCategory->children);
        $this->assertSame('RunFast', $product->brand->name);
        $this->assertSame('Footwear', $product->category->name);
        $this->assertCount(1, $product->variants);
        $this->assertSame($product->id, $variant->product->id);
        $this->assertSame($image->id, $product->primaryImage->id);
        $this->assertSame(18, $variant->inventoryLevel->available_quantity);
    }

    public function test_cart_and_item_calculations(): void
    {
        $cart = Cart::create(['currency' => 'USD']);

        $category = Category::create(['name' => 'Gadgets', 'slug' => 'gadgets']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Smart Watch',
            'slug' => 'smart-watch',
            'sku' => 'SW-01',
            'base_price' => 99.00,
        ]);

        $variant1 = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SW-01-BLK',
            'title' => 'Black',
            'price' => 99.00,
        ]);

        $variant2 = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SW-01-GLD',
            'title' => 'Gold',
            'price' => 119.00,
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant1->id,
            'quantity' => 2,
            'unit_price' => 99.00,
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant2->id,
            'quantity' => 1,
            'unit_price' => 119.00,
        ]);

        $cart->load('items');

        $this->assertSame(3, $cart->total_quantity);
        $this->assertSame(317.00, $cart->subtotal);
    }

    public function test_order_fulfillment_and_history_relationships(): void
    {
        $shippingMethod = ShippingMethod::create([
            'name' => 'Standard Delivery',
            'code' => 'std',
            'base_cost' => 5.00,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-2026-TEST-001',
            'customer_email' => 'buyer@example.com',
            'status' => 'confirmed',
            'currency' => 'USD',
            'subtotal' => 100.00,
            'shipping_total' => 5.00,
            'grand_total' => 105.00,
            'shipping_address_snapshot' => ['city' => 'Seattle'],
            'billing_address_snapshot' => ['city' => 'Seattle'],
            'shipping_method_id' => $shippingMethod->id,
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_name_snapshot' => 'Noise Cancelling Headphones',
            'sku_snapshot' => 'NCH-001',
            'unit_price' => 100.00,
            'quantity' => 1,
            'subtotal' => 100.00,
            'total' => 100.00,
        ]);

        $history = OrderHistory::create([
            'order_id' => $order->id,
            'from_status' => 'pending',
            'to_status' => 'confirmed',
            'comment' => 'Order verified successfully.',
        ]);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'courier_name' => 'FedEx',
            'tracking_number' => '1234567890',
            'status' => 'in_transit',
        ]);

        $this->assertCount(1, $order->items);
        $this->assertSame('Noise Cancelling Headphones', $order->items->first()->product_name_snapshot);
        $this->assertCount(1, $order->histories);
        $this->assertSame('confirmed', $order->histories->first()->to_status);
        $this->assertCount(1, $order->shipments);
        $this->assertSame('1234567890', $order->shipments->first()->tracking_number);
        $this->assertSame('Standard Delivery', $order->shippingMethod->name);
    }
}
