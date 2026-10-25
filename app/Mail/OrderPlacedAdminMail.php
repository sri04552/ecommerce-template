<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPlacedAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->load(['items', 'user']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🚨 New Customer Order Received: #{$this->order->order_number} (₹{$this->order->grand_total})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_placed_admin',
        );
    }
}
