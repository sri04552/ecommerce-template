<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AbandonedCartRecoveryMail;
use App\Models\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AbandonedCartController extends Controller
{
    /**
     * Display listing of abandoned carts.
     */
    public function index(Request $request): Response
    {
        $cutoff = now()->subHours(1);

        $abandonedCarts = Cart::with(['items.variant.product', 'user'])
            ->has('items')
            ->where('updated_at', '<=', $cutoff)
            ->latest('updated_at')
            ->paginate(15);

        $totalLostValue = 0;
        foreach ($abandonedCarts as $cart) {
            $totalLostValue += $cart->items->sum(fn ($i) => (float) $i->unit_price * (int) $i->quantity);
        }

        return Inertia::render('Admin/AbandonedCarts/Index', [
            'carts' => $abandonedCarts,
            'stats' => [
                'total_abandoned_count' => $abandonedCarts->total(),
                'total_lost_value' => $totalLostValue,
            ],
        ]);
    }

    /**
     * Manually dispatch recovery email to an abandoned cart customer.
     */
    public function sendRecovery(Request $request, Cart $cart): RedirectResponse
    {
        $email = $cart->customer_email ?: $cart->user?->email;

        if (! $email) {
            return back()->with('error', 'No customer email address on record for this cart.');
        }

        if (! $cart->recovery_token) {
            $cart->recovery_token = Str::random(40);
        }

        $recoveryUrl = url('/cart?recover='.$cart->recovery_token);

        try {
            Mail::to($email)->send(new AbandonedCartRecoveryMail($cart, $recoveryUrl));
            $cart->recovery_mail_sent_at = now();
            $cart->save();

            return back()->with('success', "Recovery reminder dispatched successfully to {$email}.");
        } catch (\Throwable $e) {
            Log::warning("Failed to dispatch recovery email to {$email}: ".$e->getMessage());

            return back()->with('error', 'Failed to dispatch email: '.$e->getMessage());
        }
    }
}
