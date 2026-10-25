<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Validate and apply a promotional coupon against cart subtotal.
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'coupon_code' => ['required', 'string', 'max:50'],
            'cart_subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($validated['coupon_code']));
        $subtotal = (float) $validated['cart_subtotal'];

        $promotion = Promotion::where('coupon_code', $code)->first();

        if (! $promotion) {
            return response()->json([
                'valid' => false,
                'message' => "Coupon code '{$code}' does not exist.",
            ], 422);
        }

        $error = $promotion->getValidationError($subtotal);
        if ($error !== null) {
            return response()->json([
                'valid' => false,
                'message' => $error,
            ], 422);
        }

        $discount = $promotion->calculateDiscount($subtotal);
        $newSubtotal = max(0.00, $subtotal - $discount);

        return response()->json([
            'valid' => true,
            'coupon_code' => $promotion->coupon_code,
            'title' => $promotion->title,
            'discount_type' => $promotion->discount_type,
            'discount_value' => (float) $promotion->discount_value,
            'discount_amount' => $discount,
            'original_subtotal' => $subtotal,
            'discounted_subtotal' => $newSubtotal,
            'message' => "Coupon '{$promotion->coupon_code}' applied successfully! You save ₹".number_format($discount, 2).".",
        ]);
    }
}
