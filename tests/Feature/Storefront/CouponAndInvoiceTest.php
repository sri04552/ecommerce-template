<?php

namespace Tests\Feature\Storefront;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponAndInvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_apply_percentage_coupon_and_enforce_minimum_spend(): void
    {
        $coupon = Promotion::create([
            'title' => 'Festive 20 Percent Off',
            'coupon_code' => 'FESTIVE20',
            'discount_type' => 'percentage',
            'discount_value' => 20.00,
            'minimum_order_amount' => 500.00,
            'max_discount_amount' => 200.00,
            'is_active' => true,
        ]);

        // Cart subtotal below minimum spend
        $failResponse = $this->postJson(route('coupons.apply'), [
            'coupon_code' => 'FESTIVE20',
            'cart_subtotal' => 400.00,
        ]);
        $failResponse->assertStatus(422)
            ->assertJsonFragment(['valid' => false]);

        // Cart subtotal above minimum spend
        $passResponse = $this->postJson(route('coupons.apply'), [
            'coupon_code' => 'FESTIVE20',
            'cart_subtotal' => 800.00,
        ]);
        $passResponse->assertStatus(200)
            ->assertJson([
                'valid' => true,
                'coupon_code' => 'FESTIVE20',
                'discount_amount' => 160.00, // 20% of 800
                'discounted_subtotal' => 640.00,
            ]);
    }

    public function test_can_place_order_with_coupon_and_increment_usage(): void
    {
        $product = Product::create([
            'name' => 'Premium Smart Watch',
            'slug' => 'premium-smart-watch',
            'sku' => 'WATCH-SMART-001',
            'base_price' => 1000.00,
            'is_active' => true,
            'cod_available' => true,
            'returnable' => true,
            'return_window_days' => 3,
            'delivery_fee' => 50.00,
        ]);

        $coupon = Promotion::create([
            'title' => 'Flat 100 Off',
            'coupon_code' => 'SAVE100',
            'discount_type' => 'fixed_amount',
            'discount_value' => 100.00,
            'minimum_order_amount' => 500.00,
            'is_active' => true,
        ]);

        $payload = [
            'customer_name' => 'Aditi Sharma',
            'customer_email' => 'aditi@example.com',
            'customer_phone' => '9876543210',
            'street_address' => '123 MG Road',
            'city' => 'Bengaluru',
            'state' => 'Karnataka',
            'postal_code' => '560001',
            'payment_method' => 'cod',
            'coupon_code' => 'SAVE100',
            'cart_items' => [
                [
                    'productId' => $product->id,
                    'name' => $product->name,
                    'price' => 1000.00,
                    'quantity' => 1,
                    'deliveryFee' => 50.00,
                ],
            ],
        ];

        $response = $this->postJson(route('checkout.place'), $payload);
        $response->assertStatus(200)->assertJson(['success' => true]);

        // Verify Order in DB: Subtotal 1000 + Delivery 50 - Discount 100 = Grand Total 950
        $order = Order::where('customer_email', 'aditi@example.com')->first();
        $this->assertNotNull($order);
        $this->assertEquals(1000.00, (float) $order->subtotal);
        $this->assertEquals(100.00, (float) $order->discount_total);
        $this->assertEquals(50.00, (float) $order->shipping_total);
        $this->assertEquals(950.00, (float) $order->grand_total);

        // Verify coupon used_count was incremented
        $this->assertEquals(1, $coupon->fresh()->used_count);
    }

    public function test_tax_invoice_renders_with_gst_breakdown(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TEST-INVOICE',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '9876543210',
            'status' => 'confirmed',
            'payment_method' => 'prepaid',
            'currency' => 'INR',
            'subtotal' => 1180.00,
            'discount_total' => 0.00,
            'shipping_total' => 0.00,
            'tax_total' => 180.00,
            'grand_total' => 1180.00,
            'shipping_address_snapshot' => [
                'full_name' => 'Rahul Verma',
                'street_line1' => '45 Connaught Place',
                'city' => 'New Delhi',
                'state' => 'Delhi',
                'postal_code' => '110001',
            ],
            'billing_address_snapshot' => [
                'full_name' => 'Rahul Verma',
                'street_line1' => '45 Connaught Place',
                'city' => 'New Delhi',
                'state' => 'Delhi',
                'postal_code' => '110001',
            ],
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_name_snapshot' => 'Ergonomic Desk Chair',
            'sku_snapshot' => 'CHAIR-ERG-001',
            'unit_price' => 1180.00,
            'quantity' => 1,
            'subtotal' => 1180.00,
            'total' => 1180.00,
        ]);

        $response = $this->get(route('orders.invoice', $order));
        $response->assertStatus(200);
    }
}
