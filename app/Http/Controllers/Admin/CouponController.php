<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    /**
     * Display listing of promotional coupons.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $coupons = Promotion::query()
            ->when($search, function ($query, $search) {
                $query->where('coupon_code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created promotional coupon.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'coupon_code' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:promotions,coupon_code'],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit_total' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['coupon_code'] = strtoupper($validated['coupon_code']);
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        Promotion::create($validated);

        return back()->with('success', "Coupon code '{$validated['coupon_code']}' created successfully.");
    }

    /**
     * Update an existing promotional coupon.
     */
    public function update(Request $request, Promotion $coupon): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'coupon_code' => ['required', 'string', 'max:50', 'alpha_dash', 'unique:promotions,coupon_code,'.$coupon->id],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit_total' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['coupon_code'] = strtoupper($validated['coupon_code']);
        $validated['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        $coupon->update($validated);

        return back()->with('success', "Coupon '{$coupon->coupon_code}' updated successfully.");
    }

    /**
     * Toggle coupon active status.
     */
    public function toggleStatus(Promotion $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => ! $coupon->is_active]);

        $statusText = $coupon->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "Coupon '{$coupon->coupon_code}' {$statusText}.");
    }

    /**
     * Delete an existing promotional coupon.
     */
    public function destroy(Promotion $coupon): RedirectResponse
    {
        $code = $coupon->coupon_code;
        $coupon->delete();

        return back()->with('success', "Coupon '{$code}' deleted successfully.");
    }
}
