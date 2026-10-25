<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_returns', function (Blueprint $table) {
            $table->decimal('refund_amount', 12, 2)->nullable()->after('refund_method');
            $table->string('refund_transaction_id', 100)->nullable()->after('refund_amount'); // Bank UTR or UPI Ref ID
            $table->timestamp('refunded_at')->nullable()->after('refund_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_returns', function (Blueprint $table) {
            $table->dropColumn(['refund_amount', 'refund_transaction_id', 'refunded_at']);
        });
    }
};
