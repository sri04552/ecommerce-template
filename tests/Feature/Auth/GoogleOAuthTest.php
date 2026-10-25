<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleOAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'customer'], ['display_name' => 'Customer']);
    }

    public function test_google_redirect_fails_gracefully_when_unconfigured(): void
    {
        config(['services.google.client_id' => null]);
        config(['services.google.client_secret' => null]);

        $response = $this->get('/auth/google/redirect');

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }

    public function test_google_callback_authenticates_existing_user_by_google_id(): void
    {
        config(['services.google.client_id' => 'dummy-client-id']);
        config(['services.google.client_secret' => 'dummy-client-secret']);

        $user = User::create([
            'name' => 'Google User',
            'email' => 'googleuser@example.com',
            'google_id' => 'google-unique-12345',
            'status' => 'active',
        ]);

        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'google-unique-12345';
        $socialiteUser->name = 'Google User';
        $socialiteUser->email = 'googleuser@example.com';
        $socialiteUser->user = ['email_verified' => true];

        $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('account.dashboard'));
    }

    public function test_google_callback_safely_links_existing_user_with_verified_email(): void
    {
        config(['services.google.client_id' => 'dummy-client-id']);
        config(['services.google.client_secret' => 'dummy-client-secret']);

        $existingUser = User::create([
            'name' => 'Existing Customer',
            'email' => 'customer@example.com',
            'password' => 'password123',
            'status' => 'active',
        ]);

        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'google-id-999';
        $socialiteUser->name = 'Customer Linked';
        $socialiteUser->email = 'customer@example.com';
        $socialiteUser->user = ['email_verified' => true];

        $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticatedAs($existingUser);
        $this->assertEquals('google-id-999', $existingUser->fresh()->google_id);
    }

    public function test_google_callback_refuses_to_link_unverified_email(): void
    {
        config(['services.google.client_id' => 'dummy-client-id']);
        config(['services.google.client_secret' => 'dummy-client-secret']);

        User::create([
            'name' => 'Target User',
            'email' => 'target@example.com',
            'password' => 'password123',
            'status' => 'active',
        ]);

        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'unverified-google-id';
        $socialiteUser->name = 'Attacker';
        $socialiteUser->email = 'target@example.com';
        $socialiteUser->user = ['email_verified' => false]; // Not verified by Google

        $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error');
    }

    public function test_google_callback_creates_new_user_if_non_existent(): void
    {
        config(['services.google.client_id' => 'dummy-client-id']);
        config(['services.google.client_secret' => 'dummy-client-secret']);

        $socialiteUser = new SocialiteUser;
        $socialiteUser->id = 'brand-new-google-id';
        $socialiteUser->name = 'Brand New User';
        $socialiteUser->email = 'brandnew@example.com';
        $socialiteUser->user = ['email_verified' => true];

        $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticated();
        $newUser = User::where('email', 'brandnew@example.com')->first();
        $this->assertNotNull($newUser);
        $this->assertEquals('brand-new-google-id', $newUser->google_id);
        $this->assertTrue($newUser->isCustomer());
    }
}
