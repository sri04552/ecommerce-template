<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation #{{ $order->order_number }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; line-height: 1.5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #4f46e5; color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; }
        .header p { margin: 0; opacity: 0.9; font-size: 13px; }
        .content { padding: 24px; }
        .box { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 20px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase; }
        td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; }
        .total-row { font-weight: 700; font-size: 15px; color: #0f172a; }
        .footer { background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #ecfdf5; color: #065f46; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Order!</h1>
            <p>Order #{{ $order->order_number }} has been placed successfully.</p>
        </div>

        <div class="content">
            <p style="font-size: 14px; margin-top: 0;">Hi <strong>{{ $order->shipping_address_snapshot['full_name'] ?? 'Customer' }}</strong>,</p>
            <p style="font-size: 13px; color: #475569;">We have received your order and are getting it ready for dispatch. Here is your order confirmation:</p>

            <div class="box">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span><strong>Order Number:</strong> #{{ $order->order_number }}</span>
                    <span class="badge">{{ strtoupper($order->status) }}</span>
                </div>
                <div><strong>Payment Method:</strong> {{ strtoupper($order->payment_method ?? 'COD') }}</div>
                <div><strong>Delivery Address:</strong> {{ $order->shipping_address_snapshot['street_line1'] ?? '' }}, {{ $order->shipping_address_snapshot['city'] ?? '' }}, {{ $order->shipping_address_snapshot['state'] ?? '' }} - {{ $order->shipping_address_snapshot['postal_code'] ?? '' }}</div>
            </div>

            <h3 style="font-size: 14px; margin-bottom: 8px;">Order Items</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>
                                <strong>{{ $item->product_name_snapshot }}</strong>
                                @if($item->variant_title_snapshot)
                                    <div style="font-size: 11px; color: #64748b;">Option: {{ $item->variant_title_snapshot }}</div>
                                @endif
                            </td>
                            <td style="text-align: center;">{{ $item->quantity }}</td>
                            <td style="text-align: right;">₹{{ number_format($item->total, 2) }}</td>
                        </tr>
                    @endforeach
                    <tr>
                        <td colspan="2" style="text-align: right; color: #64748b;">Subtotal:</td>
                        <td style="text-align: right;">₹{{ number_format($order->subtotal, 2) }}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: right; color: #64748b;">Delivery Fee:</td>
                        <td style="text-align: right;">{{ $order->shipping_total > 0 ? '₹' . number_format($order->shipping_total, 2) : 'FREE' }}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="2" style="text-align: right; border-top: 2px solid #0f172a;">Grand Total:</td>
                        <td style="text-align: right; border-top: 2px solid #0f172a; color: #4f46e5;">₹{{ number_format($order->grand_total, 2) }}</td>
                    </tr>
                </tbody>
            </table>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
                You can track your order status anytime by visiting our website with your order number.
            </p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} Ecommerce Store. All rights reserved.
        </div>
    </div>
</body>
</html>
