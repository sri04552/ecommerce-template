<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_analytics_dashboard(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Admin']);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole);

        // Seed sample order
        $order = Order::create([
            'order_number' => 'ORD-DASH-001',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '9876543210',
            'status' => 'confirmed',
            'payment_method' => 'prepaid',
            'currency' => 'INR',
            'subtotal' => 2000.00,
            'discount_total' => 0.00,
            'shipping_total' => 0.00,
            'tax_total' => 0.00,
            'grand_total' => 2000.00,
            'shipping_address_snapshot' => ['city' => 'Bengaluru'],
            'billing_address_snapshot' => ['city' => 'Bengaluru'],
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_name_snapshot' => 'Ergonomic Desk Chair',
            'sku_snapshot' => 'CHAIR-001',
            'unit_price' => 2000.00,
            'quantity' => 1,
            'subtotal' => 2000.00,
            'total' => 2000.00,
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);

        $analyticsResponse = $this->actingAs($admin)->get(route('admin.analytics'));
        $analyticsResponse->assertStatus(200);
    }
}
