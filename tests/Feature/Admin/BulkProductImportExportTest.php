<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class BulkProductImportExportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['display_name' => 'Admin']);
        $this->admin = User::factory()->create();
        $this->admin->roles()->attach($adminRole);
    }

    public function test_admin_can_export_products_csv(): void
    {
        Product::create([
            'name' => 'Ceramic Coffee Mug',
            'slug' => 'ceramic-coffee-mug',
            'sku' => 'MUG-001',
            'base_price' => 349.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.products.export'));
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    public function test_admin_can_download_import_template(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.products.import-template'));
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    public function test_admin_can_bulk_import_products_from_csv(): void
    {
        $csvContent = "Name,Slug,SKU,Category,Base Price,Sale Price,Delivery Fee,COD Available,Returnable,Return Window Days,Stock,Status\n"
            ."Designer Cotton Shirt,designer-cotton-shirt,SHIRT-099,Apparel,999.00,799.00,40.00,Yes,Yes,3,45,Active\n"
            .'Wireless Gaming Mouse,wireless-gaming-mouse,MOUSE-099,Electronics,1499.00,,0.00,Yes,No,3,25,Active';

        $file = UploadedFile::fake()->createWithContent('import_test.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('admin.products.import'), [
            'csv_file' => $file,
        ]);

        $response->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseHas('products', [
            'sku' => 'SHIRT-099',
            'name' => 'Designer Cotton Shirt',
            'base_price' => 999.00,
            'sale_price' => 799.00,
            'delivery_fee' => 40.00,
            'cod_available' => 1,
        ]);

        $this->assertDatabaseHas('products', [
            'sku' => 'MOUSE-099',
            'name' => 'Wireless Gaming Mouse',
            'base_price' => 1499.00,
            'delivery_fee' => 0.00,
            'has_return_exchange' => false,
        ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Apparel',
        ]);

        $this->assertDatabaseHas('product_variants', [
            'sku' => 'SHIRT-099',
            'price' => 999.00,
        ]);

        $this->assertDatabaseHas('inventory_levels', [
            'quantity_on_hand' => 45,
            'reserved_quantity' => 0,
        ]);
    }

    public function test_bulk_import_gracefully_handles_duplicate_slug_and_nonstandard_csv_mime(): void
    {
        // Pre-existing product with colliding slug
        Product::create([
            'name' => 'Designer Cotton Shirt Existing',
            'slug' => 'designer-cotton-shirt',
            'sku' => 'EXISTING-001',
            'base_price' => 500.00,
            'is_active' => true,
        ]);

        $csvContent = "Name,Slug,SKU,Category,Base Price,Sale Price,Delivery Fee,COD Available,Returnable,Return Window Days,Stock,Status\n"
            .'Designer Cotton Shirt,designer-cotton-shirt,SHIRT-999,Apparel,999.00,799.00,40.00,Yes,Yes,3,50,Active';

        $file = UploadedFile::fake()->createWithContent('import_test.csv', $csvContent);

        $response = $this->actingAs($this->admin)->post(route('admin.products.import'), [
            'csv_file' => $file,
        ]);

        $response->assertRedirect()->assertSessionHas('success');

        // New product was created with deduplicated slug and didn't crash
        $this->assertDatabaseHas('products', [
            'sku' => 'SHIRT-999',
            'slug' => 'designer-cotton-shirt-1',
        ]);
    }
}
