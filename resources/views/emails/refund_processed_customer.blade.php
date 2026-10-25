<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Refund Processed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0f172a; padding: 28px 32px; text-align: center; color: #ffffff; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #15803d; border: 1px solid #86efac; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .amount { font-size: 32px; font-weight: 900; color: #166534; margin: 6px 0; }
        .content { padding: 32px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .detail-label { color: #64748b; font-weight: 500; }
        .detail-val { font-weight: 700; color: #0f172a; font-family: monospace; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #475569; line-height: 1.6; margin-top: 20px; }
        .btn { display: block; text-align: center; background: #4f46e5; color: #ffffff !important; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 13px; margin-top: 24px; }
        .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="badge">&#10003; Refund Completed</span>
            <h1 style="margin: 8px 0 4px; font-size: 22px; font-weight: 800;">Your Refund Has Been Processed</h1>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;">Order #{{ $order->order_number }}</p>
        </div>

        <div class="content">
            <p style="font-size: 14px; margin-top: 0;">Dear {{ $order->customer_name }},</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                We have verified your returned item and successfully transferred the refund amount to your designated account.
            </p>

            <div class="amount-box">
                <span style="font-size: 12px; font-weight: 600; color: #166534; text-transform: uppercase;">Refund Amount Credited</span>
                <div class="amount">₹{{ number_format((float) $orderReturn->refund_amount, 2) }}</div>
                <span style="font-size: 11px; color: #15803d;">Transaction Reference / UTR Number below</span>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Bank UTR / UPI Ref ID:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 800; color: #0f172a; font-family: monospace; font-size: 13px;">{{ $orderReturn->refund_transaction_id }}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Refund Mode:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px; text-transform: uppercase;">{{ $orderReturn->refund_method === 'upi' ? 'UPI Transfer' : 'Bank Account (IMPS/NEFT)' }}</td>
                </tr>
                @if($orderReturn->refund_method === 'upi' && !empty($orderReturn->payout_details['upi_id']))
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Credited UPI ID:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #4f46e5; font-family: monospace; font-size: 13px;">{{ $orderReturn->payout_details['upi_id'] }}</td>
                </tr>
                @elseif(!empty($orderReturn->payout_details['account_number']))
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Account Number:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace; font-size: 13px;">XXXX{{ substr($orderReturn->payout_details['account_number'], -4) }} ({{ $orderReturn->payout_details['bank_name'] ?? 'Bank' }})</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">IFSC Code:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace; font-size: 13px;">{{ $orderReturn->payout_details['ifsc_code'] ?? '—' }}</td>
                </tr>
                @endif
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Transferred On:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #334155; font-size: 13px;">{{ now()->format('d M Y, h:i A') }}</td>
                </tr>
            </table>

            <div class="info-card">
                <strong>When will you see the money?</strong><br>
                &bull; <strong>UPI Transfers:</strong> Usually reflects immediately in your linked bank account or UPI app (PhonePe, Google Pay, Paytm, etc.).<br>
                &bull; <strong>Bank IMPS / NEFT:</strong> Reflects within 2 to 4 business hours depending on your receiving bank's clearance. You can trace this payment directly with your bank using UTR <strong>{{ $orderReturn->refund_transaction_id }}</strong>.
            </div>

            <a href="{{ url('/track?order_number='.$order->order_number) }}" class="btn">View Live Status & Order Details</a>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px;">This is an automated notification from your order fulfillment system.</p>
            <p style="margin: 0;">In accordance with Consumer Protection (E-Commerce) Rules, 2020 (India).</p>
        </div>
    </div>
</body>
</html>
