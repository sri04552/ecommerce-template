<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Role;
use App\Models\User;
use App\Services\InventoryService;
use Database\Seeders\ProductionCleanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class InventoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected InventoryService $inventoryService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductionCleanSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);

        $this->inventoryService = app(InventoryService::class);
    }

    public function test_ensure_inventory_level_creates_baseline(): void
    {
        $product = Product::create([
            'name' => 'Ceramic Plate',
            'slug' => 'ceramic-plate',
            'sku' => 'PLT-01',
            'base_price' => 22.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'PLT-01',
            'title' => 'Default',
            'price' => 22.00,
            'is_active' => true,
        ]);

        $level = $this->inventoryService->ensureVariantInventory($variant, 10, false);

        $this->assertEquals(10, $level->quantity_on_hand);
        $this->assertEquals(0, $level->reserved_quantity);
        $this->assertFalse($level->allow_backorder);
    }

    public function test_adjust_stock_records_transaction_and_updates_balance(): void
    {
        $product = Product::create([
            'name' => 'Cotton Scarf',
            'slug' => 'cotton-scarf',
            'sku' => 'SCF-01',
            'base_price' => 15.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SCF-01',
            'title' => 'Default',
            'price' => 15.00,
            'is_active' => true,
        ]);

        $this->inventoryService->ensureVariantInventory($variant, 20);

        // Adjust +5
        $tx1 = $this->inventoryService->adjustStock($variant, 5, 'restock', 'Received supplier delivery');
        $this->assertEquals(25, $tx1->balance_after);
        $this->assertEquals(25, $variant->fresh()->inventoryLevel->quantity_on_hand);

        // Adjust -3
        $tx2 = $this->inventoryService->adjustStock($variant, -3, 'order', 'Fulfillment');
        $this->assertEquals(22, $tx2->balance_after);
        $this->assertEquals(22, $variant->fresh()->inventoryLevel->quantity_on_hand);

        $this->assertCount(2, InventoryTransaction::where('product_variant_id', $variant->id)->get());
    }

    public function test_negative_stock_is_rejected_without_backorder(): void
    {
        $product = Product::create([
            'name' => 'Limited Edition Print',
            'slug' => 'limited-print',
            'sku' => 'PRT-01',
            'base_price' => 100.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'PRT-01',
            'title' => 'Default',
            'price' => 100.00,
            'is_active' => true,
        ]);

        $this->inventoryService->ensureVariantInventory($variant, 2, false);

        $this->expectException(ValidationException::class);

        // Attempting to deduct 5 units when only 2 exist
        $this->inventoryService->adjustStock($variant, -5);
    }

    public function test_negative_stock_is_permitted_when_backorder_allowed(): void
    {
        $product = Product::create([
            'name' => 'Custom Made Table',
            'slug' => 'custom-table',
            'sku' => 'TBL-01',
            'base_price' => 450.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TBL-01',
            'title' => 'Default',
            'price' => 450.00,
            'is_active' => true,
        ]);

        $this->inventoryService->ensureVariantInventory($variant, 0, true);

        // Should succeed even with negative resulting stock
        $tx = $this->inventoryService->adjustStock($variant, -2, 'backorder_sale');
        $this->assertEquals(-2, $tx->balance_after);
        $this->assertEquals(-2, $variant->fresh()->inventoryLevel->quantity_on_hand);
    }

    public function test_admin_can_adjust_stock_via_controller_endpoint(): void
    {
        $product = Product::create([
            'name' => 'Glass Vase',
            'slug' => 'glass-vase',
            'sku' => 'VSE-01',
            'base_price' => 30.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'VSE-01',
            'title' => 'Default',
            'price' => 30.00,
            'is_active' => true,
        ]);

        $this->inventoryService->ensureVariantInventory($variant, 10);

        $response = $this->actingAs($this->adminUser)->post("/admin/inventory/{$variant->id}/adjust", [
            'type' => 'receive',
            'quantity' => 15,
            'reason' => 'Warehouse stock shipment PO-551',
            'reference' => 'PO-551',
        ]);

        $response->assertRedirect('/admin/inventory');
        $this->assertEquals(25, $variant->fresh()->inventoryLevel->quantity_on_hand);
    }
}
