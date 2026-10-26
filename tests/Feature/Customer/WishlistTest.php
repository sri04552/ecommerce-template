<?php

namespace Tests\Feature\Customer;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_toggle_wishlist(): void
    {
        $product = Product::create([
            'name' => 'Running Shoes',
            'slug' => 'running-shoes',
            'sku' => 'SHOE-001',
            'base_price' => 1999.00,
            'is_active' => true,
        ]);

        $response = $this->postJson(route('wishlist.toggle', $product));
        $response->assertStatus(401);
    }

    public function test_authenticated_customer_can_toggle_wishlist_item(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'name' => 'Running Shoes',
            'slug' => 'running-shoes',
            'sku' => 'SHOE-001',
            'base_price' => 1999.00,
            'is_active' => true,
        ]);

        // 1. Add to wishlist
        $addResponse = $this->actingAs($user)->postJson(route('wishlist.toggle', $product));
        $addResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'in_wishlist' => true,
                'wishlist_count' => 1,
            ]);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        // 2. Remove from wishlist on second toggle
        $removeResponse = $this->actingAs($user)->postJson(route('wishlist.toggle', $product));
        $removeResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'in_wishlist' => false,
                'wishlist_count' => 0,
            ]);

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_customer_can_view_wishlist_page(): void
    {
        $user = User::factory()->create();
        $product = Product::create([
            'name' => 'Wireless Headphones',
            'slug' => 'wireless-headphones',
            'sku' => 'AUDIO-001',
            'base_price' => 2499.00,
            'is_active' => true,
        ]);

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($user)->get(route('account.wishlist'));
        $response->assertStatus(200);
    }

    public function test_guest_can_view_public_wishlist_page(): void
    {
        $response = $this->get(route('wishlist.index'));
        $response->assertStatus(200);
    }
}
