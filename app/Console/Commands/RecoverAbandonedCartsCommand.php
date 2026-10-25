<?php

namespace App\Console\Commands;

use App\Mail\AbandonedCartRecoveryMail;
use App\Models\Cart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class RecoverAbandonedCartsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cart:recover-abandoned {--hours=1 : Number of inactive hours to consider cart abandoned}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find inactive carts abandoned by customers and dispatch recovery emails.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $hours = (int) $this->option('hours');
        $cutoff = now()->subHours($hours);

        $this->info("Scanning for carts inactive since {$cutoff->toDateTimeString()}...");

        $abandonedCarts = Cart::with(['items.variant.product', 'user'])
            ->has('items')
            ->where('updated_at', '<=', $cutoff)
            ->whereNull('recovery_mail_sent_at')
            ->where(function ($query) {
                $query->whereNotNull('customer_email')
                    ->orWhereHas('user', function ($u) {
                        $u->whereNotNull('email');
                    });
            })
            ->get();

        $count = $abandonedCarts->count();
        $this->info("Found {$count} abandoned carts eligible for recovery notification.");

        $dispatched = 0;
        foreach ($abandonedCarts as $cart) {
            $email = $cart->customer_email ?: $cart->user?->email;
            if (! $email) {
                continue;
            }

            if (! $cart->recovery_token) {
                $cart->recovery_token = Str::random(40);
            }

            $recoveryUrl = url('/cart?recover='.$cart->recovery_token);

            try {
                Mail::to($email)->send(new AbandonedCartRecoveryMail($cart, $recoveryUrl));
                $cart->recovery_mail_sent_at = now();
                $cart->save();
                $dispatched++;
                $this->line("Dispatched recovery reminder to {$email} (Cart #{$cart->id})");
            } catch (\Throwable $e) {
                Log::warning("Failed to dispatch abandoned cart email to {$email}: ".$e->getMessage());
            }
        }

        $this->info("Successfully sent {$dispatched} recovery emails.");

        return Command::SUCCESS;
    }
}
