<?php

namespace App\Services;

use App\Models\InventoryLevel;
use App\Models\InventoryTransaction;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * Ensure a product variant has an inventory level record.
     */
    public function ensureVariantInventory(
        ProductVariant $variant,
        int $initialQuantity = 0,
        bool $allowBackorder = false
    ): InventoryLevel {
        return InventoryLevel::firstOrCreate(
            ['product_variant_id' => $variant->id],
            [
                'quantity_on_hand' => $initialQuantity,
                'reserved_quantity' => 0,
                'safety_threshold' => 5,
                'allow_backorder' => $allowBackorder,
            ]
        );
    }

    /**
     * Adjust inventory stock on hand with strict transactional ledger tracking.
     *
     * @throws ValidationException
     */
    public function adjustStock(
        ProductVariant $variant,
        int $quantityChange,
        string $referenceType = 'adjustment',
        ?string $notes = null,
        ?int $userId = null,
        ?string $referenceId = null
    ): InventoryTransaction {
        return DB::transaction(function () use (
            $variant,
            $quantityChange,
            $referenceType,
            $notes,
            $userId,
            $referenceId
        ) {
            /** @var InventoryLevel $level */
            $level = InventoryLevel::where('product_variant_id', $variant->id)
                ->lockForUpdate()
                ->first();

            if (! $level) {
                $level = InventoryLevel::create([
                    'product_variant_id' => $variant->id,
                    'quantity_on_hand' => 0,
                    'reserved_quantity' => 0,
                    'safety_threshold' => 5,
                    'allow_backorder' => false,
                ]);
            }

            $newQuantity = $level->quantity_on_hand + $quantityChange;

            // Enforce negative stock prevention unless backorders are explicitly enabled
            if ($newQuantity < 0 && ! $level->allow_backorder) {
                throw ValidationException::withMessages([
                    'quantity_change' => "Insufficient stock on hand for SKU {$variant->sku}. Available: {$level->quantity_on_hand}, Requested reduction: ".abs($quantityChange),
                ]);
            }

            $level->quantity_on_hand = $newQuantity;
            $level->save();

            // Record immutable inventory audit ledger
            return InventoryTransaction::create([
                'product_variant_id' => $variant->id,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'quantity_change' => $quantityChange,
                'balance_after' => $newQuantity,
                'notes' => $notes,
                'created_by_user_id' => $userId,
            ]);
        });
    }

    /**
     * Set absolute stock level for a product variant.
     */
    public function setStock(
        ProductVariant $variant,
        int $newQuantity,
        string $referenceType = 'manual_adjustment',
        ?string $notes = null,
        ?int $userId = null
    ): InventoryTransaction {
        $level = $this->ensureVariantInventory($variant);
        $delta = $newQuantity - $level->quantity_on_hand;

        return $this->adjustStock(
            $variant,
            $delta,
            $referenceType,
            $notes ?: "Set absolute quantity to {$newQuantity}",
            $userId
        );
    }
}
