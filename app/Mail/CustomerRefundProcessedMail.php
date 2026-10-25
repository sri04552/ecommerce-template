<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\OrderReturn;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerRefundProcessedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public OrderReturn $orderReturn
    ) {
        $this->order->load(['items', 'user']);
        $this->orderReturn->load(['item']);
    }

    public function envelope(): Envelope
    {
        $amountFormatted = number_format((float) $this->orderReturn->refund_amount, 2);

        return new Envelope(
            subject: "Refund Credited: ₹{$amountFormatted} for Order #{$this->order->order_number} (Ref: {$this->orderReturn->refund_transaction_id})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.refund_processed_customer',
        );
    }
}
