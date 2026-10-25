<?php

namespace Tests\Feature\Auth;

use App\Models\PhoneVerificationCode;
use App\Models\Role;
use App\Models\User;
use App\Services\OtpService;
use App\Services\Sms\Providers\ArraySmsProvider;
use App\Services\Sms\SmsManager;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PhoneOtpAuthTest extends TestCase
{
    use RefreshDatabase;

    protected ArraySmsProvider $arrayProvider;

    protected OtpService $otpService;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'customer'], ['display_name' => 'Customer']);

        $this->arrayProvider = new ArraySmsProvider;
        $smsManager = app(SmsManager::class);
        $smsManager->swap($this->arrayProvider);
        $this->otpService = app(OtpService::class);
    }

    public function test_phone_screen_can_be_rendered(): void
    {
        $response = $this->get('/auth/phone');
        $response->assertStatus(200);
    }

    public function test_phone_number_is_normalized_correctly(): void
    {
        $this->assertEquals('+14155552671', $this->otpService->normalizePhone('(415) 555-2671'));
        $this->assertEquals('+919876543210', $this->otpService->normalizePhone('+91 98765-43210'));
    }

    public function test_invalid_phone_number_is_rejected(): void
    {
        $response = $this->post('/auth/phone/send-otp', [
            'phone' => '123',
        ]);

        $response->assertSessionHasErrors(['phone']);
    }

    public function test_can_send_otp_and_receive_code_in_array_provider(): void
    {
        $response = $this->post('/auth/phone/send-otp', [
            'phone' => '+15551234567',
        ]);

        $response->assertSessionHas('status');
        $this->assertTrue($this->arrayProvider->hasSentTo('+15551234567'));

        $code = $this->arrayProvider->latestCodeFor('+15551234567');
        $this->assertNotNull($code);
        $this->assertEquals(6, strlen($code));

        $record = PhoneVerificationCode::where('phone', '+15551234567')->first();
        $this->assertNotNull($record);
        $this->assertTrue(Hash::check($code, $record->code_hash));
    }

    public function test_can_verify_otp_and_authenticate_new_customer(): void
    {
        $this->post('/auth/phone/send-otp', [
            'phone' => '+15559876543',
        ]);

        $code = $this->arrayProvider->latestCodeFor('+15559876543');

        $response = $this->post('/auth/phone/verify-otp', [
            'phone' => '+15559876543',
            'code' => $code,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('account.dashboard'));

        $user = User::where('phone', '+15559876543')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasVerifiedPhone());
        $this->assertTrue($user->isCustomer());
    }

    public function test_can_authenticate_existing_user_via_otp(): void
    {
        $user = User::create([
            'name' => 'Existing Phone Customer',
            'phone' => '+15553334444',
            'status' => 'active',
        ]);

        $this->post('/auth/phone/send-otp', [
            'phone' => '+15553334444',
        ]);

        $code = $this->arrayProvider->latestCodeFor('+15553334444');

        $response = $this->post('/auth/phone/verify-otp', [
            'phone' => '+15553334444',
            'code' => $code,
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('account.dashboard'));
    }

    public function test_invalid_otp_code_is_rejected_and_decrements_attempts(): void
    {
        $this->post('/auth/phone/send-otp', [
            'phone' => '+15557778888',
        ]);

        $response = $this->post('/auth/phone/verify-otp', [
            'phone' => '+15557778888',
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors(['code']);
        $this->assertGuest();

        $record = PhoneVerificationCode::where('phone', '+15557778888')->first();
        $this->assertEquals(1, $record->attempts);
    }

    public function test_otp_replay_attack_prevention(): void
    {
        $this->post('/auth/phone/send-otp', [
            'phone' => '+15551112222',
        ]);

        $code = $this->arrayProvider->latestCodeFor('+15551112222');

        // First verification succeeds
        $this->post('/auth/phone/verify-otp', [
            'phone' => '+15551112222',
            'code' => $code,
        ]);

        $this->post('/logout');
        $this->assertGuest();

        // Second verification with the same code fails because verified_at is set
        $secondAttempt = $this->post('/auth/phone/verify-otp', [
            'phone' => '+15551112222',
            'code' => $code,
        ]);

        $secondAttempt->assertSessionHasErrors(['code']);
        $this->assertGuest();
    }

    public function test_otp_resend_cooldown_enforced(): void
    {
        $this->post('/auth/phone/send-otp', [
            'phone' => '+15559990000',
        ]);

        // Attempting to send again immediately should trigger cooldown
        $response = $this->post('/auth/phone/send-otp', [
            'phone' => '+15559990000',
        ]);

        $response->assertSessionHasErrors(['phone']);
    }

    public function test_expired_otp_cannot_be_verified(): void
    {
        $this->post('/auth/phone/send-otp', [
            'phone' => '+15554445555',
        ]);

        $code = $this->arrayProvider->latestCodeFor('+15554445555');

        // Travel 6 minutes into the future
        Carbon::setTestNow(now()->addMinutes(6));

        $response = $this->post('/auth/phone/verify-otp', [
            'phone' => '+15554445555',
            'code' => $code,
        ]);

        $response->assertSessionHasErrors(['code']);
        $this->assertGuest();

        Carbon::setTestNow();
    }
}
