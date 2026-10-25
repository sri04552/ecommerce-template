<?php

namespace Tests\Feature\Admin;

use App\Mail\AdminTwoFactorCodeMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Admin']);
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);
    }

    public function test_ip_whitelist_allows_authorized_ip_and_blocks_unauthorized_ip(): void
    {
        Config::set('ecommerce.admin_allowed_ips', '127.0.0.1, 10.0.0.1');

        // Request with unauthorized IP
        $blockedResponse = $this->actingAs($this->adminUser)
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.195'])
            ->get(route('admin.products.index'));

        $blockedResponse->assertStatus(403);

        // Request with authorized IP
        $allowedResponse = $this->actingAs($this->adminUser)
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->get(route('admin.products.index'));

        $allowedResponse->assertStatus(200);
    }

    public function test_two_factor_auth_redirects_and_verifies_correct_code(): void
    {
        Mail::fake();
        Config::set('ecommerce.admin_2fa_enabled', true);

        // Accessing admin without 2FA verification redirects to challenge
        $response = $this->actingAs($this->adminUser)->get(route('admin.products.index'));
        $response->assertRedirect(route('admin.2fa.challenge'));

        // Visiting challenge dispatches code
        $challengeResponse = $this->actingAs($this->adminUser)->get(route('admin.2fa.challenge'));
        $challengeResponse->assertStatus(200);

        Mail::assertSent(AdminTwoFactorCodeMail::class);

        // Verify stored code
        $code = session('admin_2fa_code');
        $this->assertNotEmpty($code);

        // Submitting incorrect code fails
        $failResponse = $this->actingAs($this->adminUser)->post(route('admin.2fa.verify'), [
            'code' => '000000',
        ]);
        $failResponse->assertSessionHasErrors('code');

        // Submitting correct code succeeds
        $passResponse = $this->actingAs($this->adminUser)->post(route('admin.2fa.verify'), [
            'code' => $code,
        ]);
        $passResponse->assertSessionHasNoErrors();
        $this->assertTrue(session('admin_2fa_verified'));

        // Now admin pages are accessible
        $adminResponse = $this->actingAs($this->adminUser)->get(route('admin.products.index'));
        $adminResponse->assertStatus(200);
    }
}
