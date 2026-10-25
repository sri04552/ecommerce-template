<?php

namespace Tests\Feature\Admin;

use App\Mail\AbandonedCartRecoveryMail;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AbandonedCartTest extends TestCase
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

    public function test_artisan_command_detects_abandoned_cart_and_dispatches_email(): void
    {
        Mail::fake();

        $product = Product::create([
            'name' => 'Leather Laptop Sleeve',
            'slug' => 'leather-laptop-sleeve',
            'sku' => 'SLEEVE-001',
            'base_price' => 1299.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SLEEVE-001-DEF',
            'price' => 1299.00,
            'is_default' => true,
        ]);

        $cart = Cart::create([
            'customer_name' => 'Pooja Hegde',
            'customer_email' => 'pooja@example.com',
            'currency' => 'INR',
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
            'unit_price' => 1299.00,
        ]);

        // Manually age the cart to 2 hours ago
        $cart->updated_at = now()->subHours(2);
        $cart->saveQuietly();

        $this->artisan('cart:recover-abandoned', ['--hours' => 1])
            ->assertSuccessful();

        Mail::assertSent(AbandonedCartRecoveryMail::class, function ($mail) {
            return $mail->hasTo('pooja@example.com');
        });

        $this->assertNotNull($cart->fresh()->recovery_mail_sent_at);
        $this->assertNotEmpty($cart->fresh()->recovery_token);
    }

    public function test_admin_can_view_abandoned_carts_and_manually_trigger_recovery(): void
    {
        Mail::fake();

        $cart = Cart::create([
            'customer_name' => 'Kiran Kumar',
            'customer_email' => 'kiran@example.com',
            'currency' => 'INR',
        ]);

        $cart->updated_at = now()->subHours(2);
        $cart->saveQuietly();

        $viewResponse = $this->actingAs($this->admin)->get(route('admin.abandoned-carts.index'));
        $viewResponse->assertStatus(200);

        $sendResponse = $this->actingAs($this->admin)->post(route('admin.abandoned-carts.send-recovery', $cart));
        $sendResponse->assertRedirect()->assertSessionHas('success');

        Mail::assertSent(AbandonedCartRecoveryMail::class, function ($mail) {
            return $mail->hasTo('kiran@example.com');
        });
    }
}
