<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Mail\OrderPlacedAdminMail;
use App\Mail\OrderPlacedCustomerMail;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductVariant;
use App\Models\Promotion;
use App\Services\CatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService
    ) {}

    /**
     * Display live tracking page.
     */
    public function track(Request $request): Response
    {
        $orderNumber = trim((string) $request->query('order_number'));
        $order = null;

        if (! empty($orderNumber)) {
            $order = Order::where('order_number', $orderNumber)
                ->with(['items.variant.product', 'shipments', 'histories', 'returns.item'])
                ->first();
        }

        return Inertia::render('Storefront/TrackOrder', [
            'order' => $order,
            'queriedOrderNumber' => $orderNumber,
            'categories' => $this->catalogService->getVisibleCategories(),
        ]);
    }

    /**
     * Customer orders listing in account dashboard.
     */
    public function customerOrders(Request $request): Response
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)
            ->with(['items', 'shipments', 'histories', 'returns.item'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Customer/Orders', [
            'orders' => $orders,
            'categories' => $this->catalogService->getVisibleCategories(),
        ]);
    }

    /**
     * Place a customer order from cart checkout.
     */
    public function placeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'street_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'payment_method' => ['required', 'string', 'in:cod,prepaid'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'cart_items' => ['required', 'array', 'min:1', 'max:20'],
            'cart_items.*.productId' => ['required', 'integer'],
            'cart_items.*.variantId' => ['nullable'],
            'cart_items.*.name' => ['required', 'string'],
            'cart_items.*.price' => ['required', 'numeric', 'min:0'],
            'cart_items.*.quantity' => ['required', 'integer', 'min:1'],
            'cart_items.*.deliveryFee' => ['nullable', 'numeric', 'min:0'],
        ]);

        // COD Verification Check: If any item in cart has cod_available === false, reject COD
        if ($validated['payment_method'] === 'cod') {
            $productIds = collect($validated['cart_items'])->pluck('productId')->unique();
            $nonCodProducts = Product::whereIn('id', $productIds)
                ->where('cod_available', false)
                ->pluck('name')
                ->toArray();

            if (! empty($nonCodProducts)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cash on Delivery (COD) is not available for: '.implode(', ', $nonCodProducts).'. Please select Instant UPI / Online Payment.',
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $shippingTotal = 0;

            foreach ($validated['cart_items'] as $item) {
                $qty = (int) $item['quantity'];
                $price = (float) $item['price'];
                $deliveryFee = isset($item['deliveryFee']) ? (float) $item['deliveryFee'] : 0.00;

                $subtotal += ($price * $qty);
                $shippingTotal += ($deliveryFee * $qty);
            }

            // Coupon discount calculation
            $discountTotal = 0.00;
            $appliedCouponCode = null;
            if (! empty($validated['coupon_code'])) {
                $code = strtoupper(trim($validated['coupon_code']));
                $promo = Promotion::where('coupon_code', $code)->first();
                if ($promo && $promo->getValidationError($subtotal) === null) {
                    $discountTotal = $promo->calculateDiscount($subtotal);
                    $appliedCouponCode = $promo->coupon_code;
                    $promo->increment('used_count');
                }
            }

            $grandTotal = max(0.00, ($subtotal + $shippingTotal) - $discountTotal);
            $orderNumber = 'ORD-'.strtoupper(Str::random(4)).'-'.date('dmy').'-'.random_int(100, 999);

            $shippingSnapshot = [
                'full_name' => $validated['customer_name'],
                'phone' => $validated['customer_phone'],
                'street_line1' => $validated['street_address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'postal_code' => $validated['postal_code'],
                'country' => 'India',
            ];

            $orderNotes = 'Customer online web order';
            if ($appliedCouponCode) {
                $orderNotes .= " | Applied coupon: {$appliedCouponCode} (-₹{$discountTotal})";
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $request->user()?->id,
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'status' => 'pending',
                'payment_method' => $validated['payment_method'],
                'currency' => 'INR',
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'shipping_total' => $shippingTotal,
                'tax_total' => 0.00,
                'grand_total' => $grandTotal,
                'shipping_address_snapshot' => $shippingSnapshot,
                'billing_address_snapshot' => $shippingSnapshot,
                'notes' => $orderNotes,
            ]);

            foreach ($validated['cart_items'] as $item) {
                $product = Product::find($item['productId']);
                $variant = ! empty($item['variantId']) ? ProductVariant::find($item['variantId']) : null;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_variant_id' => $variant?->id,
                    'product_name_snapshot' => $product?->name ?? $item['name'],
                    'variant_title_snapshot' => $variant?->title,
                    'sku_snapshot' => $variant?->sku ?? $product?->sku ?? 'SKU-'.$item['productId'],
                    'unit_price' => (float) $item['price'],
                    'quantity' => (int) $item['quantity'],
                    'subtotal' => (float) $item['price'] * (int) $item['quantity'],
                    'tax_amount' => 0.00,
                    'total' => (float) $item['price'] * (int) $item['quantity'],
                ]);
            }

            OrderHistory::create([
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => 'pending',
                'comment' => 'Order placed by customer via storefront checkout',
                'notified_customer' => true,
                'created_by_user_id' => $request->user()?->id,
            ]);

            return $order;
        });

        // Email notifications: Customer and Store Owner / Admin
        try {
            $adminEmail = config('mail.admin_address') ?: 'bluestatemedia.srinivask@gmail.com';

            // Send to customer
            Mail::to($order->customer_email)->send(new OrderPlacedCustomerMail($order));

            // Send to admin / client
            Mail::to($adminEmail)->send(new OrderPlacedAdminMail($order));
        } catch (\Throwable $e) {
            Log::warning('Order email notification failed: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'order_number' => $order->order_number,
            'grand_total' => $order->grand_total,
            'message' => "Order #{$order->order_number} placed successfully!",
        ]);
    }

    /**
     * Submit a Return or Exchange request with Bank or UPI details.
     */
    public function requestReturn(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'order_item_id' => ['required', 'exists:order_items,id'],
            'type' => ['required', 'string', 'in:return,exchange'],
            'reason' => ['required', 'string', 'max:100'],
            'details' => ['nullable', 'string', 'max:500'],
            'refund_method' => ['required', 'string', 'in:upi,bank_transfer'],
            'upi_id' => ['required_if:refund_method,upi', 'nullable', 'string', 'max:100'],
            'account_holder_name' => ['required_if:refund_method,bank_transfer', 'nullable', 'string', 'max:120'],
            'account_number' => ['required_if:refund_method,bank_transfer', 'nullable', 'string', 'max:35'],
            'ifsc_code' => ['required_if:refund_method,bank_transfer', 'nullable', 'string', 'max:20'],
            'bank_name' => ['required_if:refund_method,bank_transfer', 'nullable', 'string', 'max:100'],
        ]);

        $item = OrderItem::where('id', $validated['order_item_id'])
            ->where('order_id', $order->id)
            ->firstOrFail();

        // Check if product allows return
        $product = $item->variant?->product;
        if ($product && ! $product->has_return_exchange) {
            return response()->json([
                'success' => false,
                'message' => 'This product is marked as Non-Returnable and does not accept returns or exchanges.',
            ], 422);
        }

        $payoutDetails = [];
        if ($validated['refund_method'] === 'upi') {
            $payoutDetails = [
                'type' => 'UPI',
                'upi_id' => $validated['upi_id'],
            ];
        } else {
            $payoutDetails = [
                'type' => 'Bank Account Transfer (NEFT/IMPS)',
                'account_holder_name' => $validated['account_holder_name'],
                'account_number' => $validated['account_number'],
                'ifsc_code' => strtoupper($validated['ifsc_code']),
                'bank_name' => $validated['bank_name'],
            ];
        }

        $returnRequest = OrderReturn::create([
            'order_id' => $order->id,
            'order_item_id' => $item->id,
            'user_id' => $request->user()?->id ?? $order->user_id,
            'type' => $validated['type'],
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'requested',
            'refund_method' => $validated['refund_method'],
            'payout_details' => $payoutDetails,
        ]);

        OrderHistory::create([
            'order_id' => $order->id,
            'from_status' => $order->status,
            'to_status' => $order->status,
            'comment' => "Customer requested {$validated['type']} for item '{$item->product_name_snapshot}'. Payout: {$validated['refund_method']}.",
            'notified_customer' => true,
            'created_by_user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your '.ucfirst($validated['type']).' request has been registered. Our inspection team will process pickup and credit your refund to your '.strtoupper($validated['refund_method']).' account.',
        ]);
    }

    /**
     * Submit a customer review with star rating and photo.
     */
    public function storeReview(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:100'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:150'],
            'comment' => ['required', 'string', 'min:5', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['nullable', 'string'],
        ]);

        $review = ProductReview::create([
            'product_id' => $product->id,
            'user_id' => $request->user()?->id,
            'author_name' => $validated['author_name'],
            'rating' => (int) $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'],
            'is_verified_purchase' => true,
            'photos' => $validated['photos'] ?? [],
            'is_approved' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your review! Your 5-star rating and photo have been published.',
            'review' => $review,
        ]);
    }

    /**
     * Display or print GST-compliant Tax Invoice for an order.
     */
    public function invoice(Order $order): Response
    {
        $order->loadMissing(['items.variant.product', 'shipments']);

        $storeState = config('ecommerce.store_state', 'Karnataka');
        $storeGstin = config('ecommerce.gstin', '29AAAAA0000A1Z5');
        $customerState = $order->shipping_address_snapshot['state'] ?? 'Karnataka';

        $isIntraState = strcasecmp(trim($customerState), trim($storeState)) === 0;

        // Standard GST tax rate (18% inclusive in consumer pricing)
        $taxableAmount = round($order->subtotal / 1.18, 2);
        $totalGst = round($order->subtotal - $taxableAmount, 2);

        $taxBreakdown = [
            'is_intra_state' => $isIntraState,
            'taxable_amount' => $taxableAmount,
            'total_gst' => $totalGst,
            'cgst_rate' => $isIntraState ? 9.0 : 0.0,
            'cgst_amount' => $isIntraState ? round($totalGst / 2, 2) : 0.0,
            'sgst_rate' => $isIntraState ? 9.0 : 0.0,
            'sgst_amount' => $isIntraState ? round($totalGst / 2, 2) : 0.0,
            'igst_rate' => $isIntraState ? 0.0 : 18.0,
            'igst_amount' => $isIntraState ? 0.0 : $totalGst,
            'supplier_state' => $storeState,
            'place_of_supply' => $customerState,
            'supplier_gstin' => $storeGstin,
        ];

        return Inertia::render('Storefront/Invoice', [
            'order' => $order,
            'taxBreakdown' => $taxBreakdown,
            'categories' => $this->catalogService->getVisibleCategories(),
        ]);
    }
}
