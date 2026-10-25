<?php

namespace Tests\Feature\Customer;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'customer'], ['display_name' => 'Customer']);
    }

    public function test_guest_cannot_access_customer_account(): void
    {
        $response = $this->get('/account');
        $response->assertRedirect('/login');
    }

    public function test_customer_can_view_account_dashboard(): void
    {
        $user = User::create([
            'name' => 'John Customer',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->actingAs($user)->get('/account');
        $response->assertStatus(200);
    }

    public function test_customer_can_update_profile_info(): void
    {
        $user = User::create([
            'name' => 'Old Name',
            'email' => 'keep@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $user->customerProfile()->create();

        $response = $this->actingAs($user)->put('/account/profile', [
            'name' => 'New Name',
            'email' => 'keep@example.com',
            'birth_date' => '1995-05-15',
            'gender' => 'female',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('New Name', $user->fresh()->name);
        $this->assertEquals('female', $user->fresh()->customerProfile->gender);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_updating_email_resets_verification_and_sends_notification(): void
    {
        Notification::fake();

        $user = User::create([
            'name' => 'User One',
            'email' => 'initial@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        $user->customerProfile()->create();

        $response = $this->actingAs($user)->put('/account/profile', [
            'name' => 'User One',
            'email' => 'changed@example.com',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('changed@example.com', $user->fresh()->email);
        $this->assertNull($user->fresh()->email_verified_at);

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_customer_can_change_password(): void
    {
        $user = User::create([
            'name' => 'Password Changer',
            'email' => 'change@example.com',
            'password' => Hash::make('CurrentPassword123!'),
        ]);

        $response = $this->actingAs($user)->put('/account/password', [
            'current_password' => 'CurrentPassword123!',
            'password' => 'BrandNewPassword123!',
            'password_confirmation' => 'BrandNewPassword123!',
        ]);

        $response->assertSessionHas('success');
        $this->assertTrue(Hash::check('BrandNewPassword123!', $user->fresh()->password));
    }

    public function test_customer_cannot_change_password_with_incorrect_current_password(): void
    {
        $user = User::create([
            'name' => 'Failed Changer',
            'email' => 'failed@example.com',
            'password' => Hash::make('CorrectPassword123!'),
        ]);

        $response = $this->actingAs($user)->put('/account/password', [
            'current_password' => 'WrongPassword',
            'password' => 'BrandNewPassword123!',
            'password_confirmation' => 'BrandNewPassword123!',
        ]);

        $response->assertSessionHasErrors(['current_password']);
        $this->assertTrue(Hash::check('CorrectPassword123!', $user->fresh()->password));
    }
}
