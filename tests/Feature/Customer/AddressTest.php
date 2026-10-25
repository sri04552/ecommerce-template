<?php

namespace Tests\Feature\Customer;

use App\Models\CustomerAddress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_view_saved_addresses(): void
    {
        $user = User::create([
            'name' => 'Address User',
            'email' => 'address@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAs($user)->get('/account/addresses');
        $response->assertStatus(200);
    }

    public function test_customer_can_create_address_and_first_address_is_default(): void
    {
        $user = User::create([
            'name' => 'First Address User',
            'email' => 'first@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAs($user)->post('/account/addresses', [
            'recipient_name' => 'John Recipient',
            'phone' => '+15551234567',
            'address_line1' => '123 Market St',
            'city' => 'San Francisco',
            'state' => 'CA',
            'postal_code' => '94105',
            'country_code' => 'US',
        ]);

        $response->assertSessionHas('success');

        $address = CustomerAddress::where('user_id', $user->id)->first();
        $this->assertNotNull($address);
        $this->assertEquals('123 Market St', $address->address_line1);
        $this->assertTrue((bool) $address->is_default);
    }

    public function test_adding_new_default_address_unsets_previous_default(): void
    {
        $user = User::create([
            'name' => 'Multi Address User',
            'email' => 'multi@example.com',
            'password' => Hash::make('password123'),
        ]);

        $firstAddress = CustomerAddress::create([
            'user_id' => $user->id,
            'recipient_name' => 'First Address',
            'phone' => '+15551111111',
            'address_line1' => '100 First St',
            'city' => 'New York',
            'state' => 'NY',
            'postal_code' => '10001',
            'country_code' => 'US',
            'is_default' => true,
        ]);

        $this->actingAs($user)->post('/account/addresses', [
            'recipient_name' => 'Second Address',
            'phone' => '+15552222222',
            'address_line1' => '200 Second St',
            'city' => 'Brooklyn',
            'state' => 'NY',
            'postal_code' => '11201',
            'country_code' => 'US',
            'is_default' => true,
        ]);

        $this->assertFalse((bool) $firstAddress->fresh()->is_default);
        $secondAddress = CustomerAddress::where('user_id', $user->id)->where('address_line1', '200 Second St')->first();
        $this->assertTrue((bool) $secondAddress->is_default);
    }

    public function test_customer_cannot_update_another_customers_address(): void
    {
        $userA = User::create(['name' => 'User A', 'email' => 'a@example.com', 'password' => 'pass']);
        $userB = User::create(['name' => 'User B', 'email' => 'b@example.com', 'password' => 'pass']);

        $addressB = CustomerAddress::create([
            'user_id' => $userB->id,
            'recipient_name' => 'User B Address',
            'phone' => '+15553333333',
            'address_line1' => '300 Third St',
            'city' => 'Chicago',
            'state' => 'IL',
            'postal_code' => '60601',
            'country_code' => 'US',
            'is_default' => true,
        ]);

        $response = $this->actingAs($userA)->put("/account/addresses/{$addressB->id}", [
            'recipient_name' => 'Malicious Edit',
            'phone' => '+15553333333',
            'address_line1' => 'Hacked St',
            'city' => 'Chicago',
            'state' => 'IL',
            'postal_code' => '60601',
            'country_code' => 'US',
        ]);

        $response->assertStatus(403);
        $this->assertEquals('300 Third St', $addressB->fresh()->address_line1);
    }

    public function test_customer_cannot_delete_another_customers_address(): void
    {
        $userA = User::create(['name' => 'User A', 'email' => 'a2@example.com', 'password' => 'pass']);
        $userB = User::create(['name' => 'User B', 'email' => 'b2@example.com', 'password' => 'pass']);

        $addressB = CustomerAddress::create([
            'user_id' => $userB->id,
            'recipient_name' => 'User B Address',
            'phone' => '+15554444444',
            'address_line1' => '400 Fourth St',
            'city' => 'Austin',
            'state' => 'TX',
            'postal_code' => '78701',
            'country_code' => 'US',
            'is_default' => true,
        ]);

        $response = $this->actingAs($userA)->delete("/account/addresses/{$addressB->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('customer_addresses', ['id' => $addressB->id]);
    }
}
