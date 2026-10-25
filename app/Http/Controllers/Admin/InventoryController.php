<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    /**
     * Display a listing of inventory levels across product variants.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = ProductVariant::query()
            ->with(['product', 'inventoryLevel'])
            ->latest();

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('sku', 'like', "%{$term}%")
                    ->orWhere('title', 'like', "%{$term}%")
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$term}%"));
            });
        }

        $variants = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Inventory/Index', [
            'variants' => $variants,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Adjust stock on hand for a specific product variant.
     */
    public function adjust(Request $request, ProductVariant $variant): RedirectResponse
    {
        $validated = $request->validate([
            'quantity_change' => ['nullable', 'integer', 'not_in:0'],
            'quantity' => ['nullable', 'integer', 'not_in:0'],
            'reference_type' => ['nullable', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:255'],
            'reason' => ['nullable', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:64'],
        ]);

        $rawQty = $validated['quantity_change'] ?? $validated['quantity'] ?? null;
        if ($rawQty === null) {
            throw ValidationException::withMessages([
                'quantity_change' => 'Quantity change is required.',
            ]);
        }

        $type = $validated['reference_type'] ?? $validated['type'] ?? 'adjustment';
        $quantityChange = (int) $rawQty;

        if ($type === 'scrap' && $quantityChange > 0) {
            $quantityChange = -$quantityChange;
        }

        $notes = $validated['reason'] ?? $validated['notes'] ?? null;
        $referenceId = $validated['reference'] ?? null;

        $this->inventoryService->adjustStock(
            $variant,
            $quantityChange,
            $type,
            $notes,
            $request->user()?->id,
            $referenceId
        );

        return redirect()->route('admin.inventory.index')
            ->with('success', "Stock for SKU {$variant->sku} updated successfully.");
    }
}
