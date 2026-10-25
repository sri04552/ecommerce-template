<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CustomerRefundProcessedMail;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderReturn;
use App\Models\Shipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display a paginated listing of customer orders.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Order::query()
            ->with(['items', 'shipments', 'user'])
            ->latest();

        if (! empty($status)) {
            $query->where('status', $status);
        }

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', "%{$term}%")
                    ->orWhere('customer_email', 'like', "%{$term}%")
                    ->orWhere('customer_phone', 'like', "%{$term}%");
            });
        }

        $orders = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
        ];

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show detailed order information.
     */
    public function show(Order $order): Response
    {
        $order->load(['items.variant.product', 'shipments', 'histories.createdByUser', 'user']);

        $returns = OrderReturn::where('order_id', $order->id)
            ->with(['item'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'returns' => $returns,
        ]);
    }

    /**
     * Update order fulfillment status and optional tracking details.
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
            'comment' => ['nullable', 'string', 'max:500'],
            'courier_name' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'tracking_url' => ['nullable', 'url', 'max:500'],
        ]);

        $oldStatus = $order->status;
        $order->update([
            'status' => $validated['status'],
        ]);

        // If shipped, create or update shipment tracking
        if ($validated['status'] === 'shipped' && ! empty($validated['tracking_number'])) {
            Shipment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'courier_name' => $validated['courier_name'] ?: 'Standard Surface Delivery',
                    'tracking_number' => $validated['tracking_number'],
                    'tracking_url' => $validated['tracking_url'] ?? null,
                    'status' => 'in_transit',
                    'shipped_at' => now(),
                ]
            );
        } elseif ($validated['status'] === 'delivered') {
            $shipment = $order->shipments()->first();
            if ($shipment) {
                $shipment->update([
                    'status' => 'delivered',
                    'delivered_at' => now(),
                ]);
            }
        }

        OrderHistory::create([
            'order_id' => $order->id,
            'from_status' => $oldStatus,
            'to_status' => $validated['status'],
            'comment' => $validated['comment'] ?: "Status updated to {$validated['status']} by administrator.",
            'notified_customer' => true,
            'created_by_user_id' => $request->user()?->id,
        ]);

        return back()->with('success', "Order #{$order->order_number} status updated to ".strtoupper($validated['status']).".");
    }

    /**
     * Update customer return/exchange status.
     */
    public function updateReturn(Request $request, OrderReturn $return): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:requested,approved,rejected,completed'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $return->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        return back()->with('success', "Return request updated to ".strtoupper($validated['status']).".");
    }

    /**
     * Process and record customer refund payment with Bank UTR / UPI Reference.
     */
    public function processRefund(Request $request, OrderReturn $return): RedirectResponse
    {
        $validated = $request->validate([
            'refund_amount' => ['required', 'numeric', 'min:1'],
            'refund_transaction_id' => ['required', 'string', 'max:100'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $order = $return->order;

        $return->update([
            'status' => 'refunded',
            'refund_amount' => $validated['refund_amount'],
            'refund_transaction_id' => trim($validated['refund_transaction_id']),
            'refunded_at' => now(),
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        OrderHistory::create([
            'order_id' => $order->id,
            'from_status' => $order->status,
            'to_status' => $order->status,
            'comment' => "Refund of ₹{$validated['refund_amount']} transferred via ".strtoupper((string) $return->refund_method)." (UTR / Ref: {$validated['refund_transaction_id']}).",
            'notified_customer' => true,
            'created_by_user_id' => $request->user()?->id,
        ]);

        // Dispatch Email Notification to Customer
        try {
            Mail::to($order->customer_email)->send(new CustomerRefundProcessedMail($order, $return));
        } catch (\Throwable $e) {
            Log::warning('Refund notification email failed: '.$e->getMessage());
        }

        return back()->with('success', "Refund of ₹{$validated['refund_amount']} recorded successfully. Customer notified via email with UTR: {$validated['refund_transaction_id']}.");
    }
}
