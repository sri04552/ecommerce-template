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
            if (! Schema::hasColumn('products', 'offer_tag')) {
                $table->string('offer_tag', 60)->nullable()->after('sale_price');
            }
            if (! Schema::hasColumn('products', 'discount_percentage')) {
                $table->decimal('discount_percentage', 5, 2)->nullable()->after('offer_tag');
            }
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->mediumText('image_path')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['offer_tag', 'discount_percentage']);
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->string('image_path', 255)->change();
        });
    }
};
