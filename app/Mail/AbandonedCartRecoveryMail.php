<?php

namespace App\Mail;

use App\Models\Cart;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbandonedCartRecoveryMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Cart $cart,
        public string $recoveryUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Did you forget something? Complete your order now! - '.config('app.name'),
        );
    }

    public function content(): Content
    {
        $recipientName = $this->cart->customer_name ?: ($this->cart->user?->name ?: 'Valued Customer');

        return new Content(
            htmlString: '
            <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">Your Shopping Cart is Waiting</h2>
                </div>
                <p style="color: #334155; font-size: 15px;">Hello <strong>'.htmlspecialchars($recipientName).'</strong>,</p>
                <p style="color: #475569; font-size: 14px; line-height: 1.6;">We noticed you left some great items in your shopping cart. Stock is limited and items sell out fast, so we have reserved them for you!</p>
                
                <div style="margin: 28px 0; text-align: center;">
                    <a href="'.htmlspecialchars($this->recoveryUrl).'" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
                        Return to Cart & Complete Checkout &rarr;
                    </a>
                </div>

                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If you have any questions or need help with payment, simply reply to this email.</p>
                <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #94a3b8;">
                    '.config('app.name').' &bull; Fast Delivery & Secure Shopping Across India
                </div>
            </div>',
        );
    }
}
