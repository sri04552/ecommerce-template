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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('has_return_exchange')->default(true)->after('delivery_fee');
            $table->unsignedSmallInteger('return_window_days')->default(7)->after('has_return_exchange');
            $table->boolean('cod_available')->default(true)->after('return_window_days');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['has_return_exchange', 'return_window_days', 'cod_available']);
        });
    }
};
