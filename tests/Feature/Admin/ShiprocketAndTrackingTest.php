<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\Role;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiprocketAndTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole);
    }

    public function test_admin_can_generate_shiprocket_awb(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-SHIP-001',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '9876543210',
            'status' => 'confirmed',
            'payment_method' => 'cod',
            'currency' => 'INR',
            'subtotal' => 1500.00,
            'discount_total' => 0.00,
            'shipping_total' => 50.00,
            'tax_total' => 0.00,
            'grand_total' => 1550.00,
            'shipping_address_snapshot' => [
                'full_name' => 'Rajesh Sharma',
                'street_line1' => 'Plot 4, Indiranagar',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'postal_code' => '560038',
            ],
            'billing_address_snapshot' => [
                'full_name' => 'Rajesh Sharma',
                'street_line1' => 'Plot 4, Indiranagar',
                'city' => 'Bengaluru',
                'state' => 'Karnataka',
                'postal_code' => '560038',
            ],
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.orders.generate-shiprocket-awb', $order));

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
        ]);

        $shipment = Shipment::where('order_id', $order->id)->first();
        $this->assertNotNull($shipment);
        $this->assertNotEmpty($shipment->tracking_number);
        $this->assertNotEmpty($shipment->courier_name);
    }

    public function test_tracking_webhook_updates_order_status_to_delivered(): void
    {
        $order = Order::create([
            'order_number' => 'ORD-TRACK-WEBHOOK',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '9876543210',
            'status' => 'processing',
            'payment_method' => 'prepaid',
            'currency' => 'INR',
            'subtotal' => 800.00,
            'discount_total' => 0.00,
            'shipping_total' => 0.00,
            'tax_total' => 0.00,
            'grand_total' => 800.00,
            'shipping_address_snapshot' => ['city' => 'Bengaluru'],
            'billing_address_snapshot' => ['city' => 'Bengaluru'],
        ]);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'courier_name' => 'Delhivery Surface',
            'tracking_number' => 'SR-TEST-AWB-99',
            'tracking_url' => 'https://shiprocket.co/tracking/SR-TEST-AWB-99',
            'shipped_at' => now(),
        ]);

        $response = $this->postJson(route('webhooks.shipping.tracking'), [
            'awb' => 'SR-TEST-AWB-99',
            'current_status' => 'DELIVERED',
        ]);

        $response->assertStatus(200)->assertJson(['status' => 'ok']);

        $this->assertEquals('delivered', $order->fresh()->status);
        $this->assertNotNull($shipment->fresh()->delivered_at);
    }
}
