<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        $user = User::create([
            'name' => 'Forgot Password User',
            'email' => 'forgot@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/forgot-password', [
            'email' => 'forgot@example.com',
        ]);

        $response->assertSessionHas('status');
    }

    public function test_requesting_reset_link_with_unknown_email_does_not_enumerate(): void
    {
        $response = $this->post('/forgot-password', [
            'email' => 'unknown@example.com',
        ]);

        // Returns status without throwing 404 or revealing account status
        $response->assertSessionHas('status');
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        $user = User::create([
            'name' => 'Reset User',
            'email' => 'reset@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = Password::createToken($user);

        $response = $this->get("/reset-password/{$token}?email=reset@example.com");

        $response->assertStatus(200);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Event::fake([PasswordReset::class]);

        $user = User::create([
            'name' => 'New Password User',
            'email' => 'newpass@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = Password::createToken($user);

        $response = $this->post('/reset-password', [
            'token' => $token,
            'email' => 'newpass@example.com',
            'password' => 'NewSecurePassword123!',
            'password_confirmation' => 'NewSecurePassword123!',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/login');
        $this->assertTrue(Hash::check('NewSecurePassword123!', $user->fresh()->password));

        Event::assertDispatched(PasswordReset::class);
    }
}
