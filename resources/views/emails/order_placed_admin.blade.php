<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Order Alert #{{ $order->order_number }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; line-height: 1.5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f172a; color: #ffffff; padding: 24px; }
        .header h1 { margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #38bdf8; }
        .content { padding: 24px; font-size: 13px; }
        .box { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 14px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th { text-align: left; padding: 8px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
        .footer { background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 New Order Placed: #{{ $order->order_number }}</h1>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">Grand Total: ₹{{ number_format($order->grand_total, 2) }} &bull; Payment: {{ strtoupper($order->payment_method ?? 'COD') }}</p>
        </div>

        <div class="content">
            <div class="box">
                <p style="margin: 0 0 6px 0;"><strong>Customer Name:</strong> {{ $order->shipping_address_snapshot['full_name'] ?? 'Guest Customer' }}</p>
                <p style="margin: 0 0 6px 0;"><strong>Email:</strong> {{ $order->customer_email }}</p>
                <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> {{ $order->customer_phone ?? ($order->shipping_address_snapshot['phone'] ?? 'N/A') }}</p>
                <p style="margin: 0;"><strong>Shipping Destination:</strong> {{ $order->shipping_address_snapshot['street_line1'] ?? '' }}, {{ $order->shipping_address_snapshot['city'] ?? '' }}, {{ $order->shipping_address_snapshot['state'] ?? '' }} - {{ $order->shipping_address_snapshot['postal_code'] ?? '' }}</p>
            </div>

            <h3 style="font-size: 14px; margin-bottom: 6px;">Ordered Items ({{ $order->items->count() }})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product & SKU</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>
                                <strong>{{ $item->product_name_snapshot }}</strong>
                                <div style="font-size: 11px; color: #64748b;">SKU: {{ $item->sku_snapshot }}</div>
                            </td>
                            <td style="text-align: center;">{{ $item->quantity }}</td>
                            <td style="text-align: right;">₹{{ number_format($item->total, 2) }}</td>
                        </tr>
                    @endforeach
                    <tr>
                        <td colspan="2" style="text-align: right; font-weight: bold;">Delivery Fee:</td>
                        <td style="text-align: right; font-weight: bold;">{{ $order->shipping_total > 0 ? '₹' . number_format($order->shipping_total, 2) : 'FREE' }}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: right; font-weight: bold; font-size: 14px;">Grand Total:</td>
                        <td style="text-align: right; font-weight: bold; font-size: 14px; color: #0284c7;">₹{{ number_format($order->grand_total, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            Admin Store Notification &bull; {{ config('app.name') }}
        </div>
    </div>
</body>
</html>
