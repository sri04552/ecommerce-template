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
        Schema::table('carts', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('user_id');
            $table->string('customer_email')->nullable()->after('customer_name')->index();
            $table->string('customer_phone')->nullable()->after('customer_email');
            $table->string('recovery_token', 64)->nullable()->unique()->after('expires_at');
            $table->timestamp('recovery_mail_sent_at')->nullable()->after('recovery_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['customer_name', 'customer_email', 'customer_phone', 'recovery_token', 'recovery_mail_sent_at']);
        });
    }
};
