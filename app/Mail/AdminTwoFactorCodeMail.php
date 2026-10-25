<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminTwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $otpCode
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Security Verification Code - '.config('app.name', 'Admin Portal'),
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '
            <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Administrator Security Verification</h2>
                </div>
                <p style="color: #334155; font-size: 15px;">Hello <strong>'.htmlspecialchars($this->user->name).'</strong>,</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.6;">A sign-in attempt requires Two-Factor Authentication to access the store administration dashboard. Please enter this single-use security code:</p>
                <div style="margin: 28px 0; text-align: center;">
                    <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b; background: #f1f5f9; padding: 12px 28px; border-radius: 8px; border: 1px dashed #94a3b8;">
                        '.$this->otpCode.'
                    </span>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not attempt this sign-in, please change your password immediately.</p>
                <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8;">
                    Secure Admin Portal &bull; '.config('app.name').'
                </div>
            </div>',
        );
    }
}
