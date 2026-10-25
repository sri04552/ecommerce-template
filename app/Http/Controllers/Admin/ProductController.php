<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Services\CatalogService;
use App\Services\InventoryService;
use App\Services\ImageOptimizationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService,
        protected InventoryService $inventoryService,
        protected ImageOptimizationService $imageService
    ) {}

    /**
     * Display a paginated listing of catalog products.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $categoryId = $request->query('category');
        $status = $request->query('status');

        $query = Product::query()
            ->with(['category', 'brand', 'primaryImage', 'variants.inventoryLevel'])
            ->latest();

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%");
            });
        }

        if (! empty($categoryId)) {
            $query->where('category_id', $categoryId);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'draft') {
            $query->where('is_active', false);
        }

        $products = $query->paginate(15)->withQueryString();
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'brands' => Brand::where('is_active', true)->orderBy('name')->get(),
            'selectedCategoryId' => $request->query('category_id') ? (int) $request->query('category_id') : null,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:64', 'unique:products,sku'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'offer_tag' => ['nullable', 'string', 'max:60'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'initial_stock' => ['nullable', 'integer', 'min:0'],
            'allow_backorder' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'primary_image_url' => ['nullable', 'string', 'max:1000'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        $basePrice = (float) $validated['base_price'];
        $salePrice = isset($validated['sale_price']) && $validated['sale_price'] !== '' ? (float) $validated['sale_price'] : null;
        $discountPercent = isset($validated['discount_percentage']) && $validated['discount_percentage'] !== '' ? (float) $validated['discount_percentage'] : null;

        // Auto calculate discount percentage or sale price
        if ($discountPercent && ! $salePrice && $discountPercent > 0) {
            $salePrice = round($basePrice * (1 - ($discountPercent / 100)), 2);
        } elseif ($salePrice && $salePrice < $basePrice && ! $discountPercent) {
            $discountPercent = round((($basePrice - $salePrice) / $basePrice) * 100, 2);
        }

        DB::transaction(function () use ($validated, $request, $basePrice, $salePrice, $discountPercent) {
            $slug = $this->catalogService->generateUniqueSlug($validated['name']);

            $product = Product::create([
                'category_id' => $validated['category_id'] ?? null,
                'brand_id' => $validated['brand_id'] ?? null,
                'name' => $validated['name'],
                'slug' => $slug,
                'sku' => strtoupper($validated['sku']),
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'base_price' => $basePrice,
                'sale_price' => $salePrice,
                'offer_tag' => $validated['offer_tag'] ?? null,
                'discount_percentage' => $discountPercent,
                'cost_price' => $validated['cost_price'] ?? null,
                'has_variants' => false,
                'is_featured' => ! empty($validated['is_featured']),
                'is_active' => isset($validated['is_active']) ? (bool) $validated['is_active'] : true,
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
            ]);

            // Create default variant for consistent inventory management
            $variant = ProductVariant::create([
                'product_id' => $product->id,
                'sku' => $product->sku,
                'title' => 'Default',
                'price' => $product->base_price,
                'sale_price' => $product->sale_price,
                'is_active' => true,
            ]);

            // Initialize inventory level
            $initialStock = (int) ($validated['initial_stock'] ?? 0);
            $allowBackorder = ! empty($validated['allow_backorder']);

            $this->inventoryService->ensureVariantInventory($variant, 0, $allowBackorder);

            if ($initialStock > 0) {
                $this->inventoryService->adjustStock(
                    $variant,
                    $initialStock,
                    'initial_stock',
                    'Initial stock on product creation',
                    $request->user()?->id
                );
            }

            // Process manual multi-image uploads (strictly sub-100kb WebP, 1:1 square ratio)
            if ($request->hasFile('images')) {
                $uploadedFiles = $request->file('images');
                foreach ($uploadedFiles as $idx => $file) {
                    if ($file && $file->isValid()) {
                        $processed = $this->imageService->processProductImage($file, $product->slug, $idx);
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $processed['image_path'],
                            'alt_text' => $product->name,
                            'is_primary' => ($idx === 0),
                            'sort_order' => $idx,
                        ]);
                    }
                }
            } else {
                // Fallback to URL if manual file was not attached
                $imageUrl = $validated['primary_image_url'] ?? $validated['image_url'] ?? null;
                if (! empty($imageUrl)) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $imageUrl,
                        'alt_text' => $product->name,
                        'is_primary' => true,
                        'sort_order' => 0,
                    ]);
                }
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully with optimized 1:1 images.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        $product->load(['category', 'brand', 'images', 'variants.inventoryLevel']);

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'hasOrders' => $product->hasOrders(),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'brands' => Brand::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        // Anti-tampering check: Prevent editing products that have already been ordered
        if ($product->hasOrders()) {
            return back()->withErrors([
                'error' => 'This product cannot be edited because customers have already placed orders for it. Product details and prices are strictly locked to protect order history and prevent tampering.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:64', Rule::unique('products')->ignore($product->id)],
            'category_id' => ['nullable', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'offer_tag' => ['nullable', 'string', 'max:60'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'primary_image_url' => ['nullable', 'string', 'max:1000'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        $basePrice = (float) $validated['base_price'];
        $salePrice = isset($validated['sale_price']) && $validated['sale_price'] !== '' ? (float) $validated['sale_price'] : null;
        $discountPercent = isset($validated['discount_percentage']) && $validated['discount_percentage'] !== '' ? (float) $validated['discount_percentage'] : null;

        if ($discountPercent && ! $salePrice && $discountPercent > 0) {
            $salePrice = round($basePrice * (1 - ($discountPercent / 100)), 2);
        } elseif ($salePrice && $salePrice < $basePrice && ! $discountPercent) {
            $discountPercent = round((($basePrice - $salePrice) / $basePrice) * 100, 2);
        }

        DB::transaction(function () use ($product, $validated, $request, $basePrice, $salePrice, $discountPercent) {
            $product->update([
                'category_id' => $validated['category_id'] ?? null,
                'brand_id' => $validated['brand_id'] ?? null,
                'name' => $validated['name'],
                'sku' => strtoupper($validated['sku']),
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'base_price' => $basePrice,
                'sale_price' => $salePrice,
                'offer_tag' => $validated['offer_tag'] ?? null,
                'discount_percentage' => $discountPercent,
                'cost_price' => $validated['cost_price'] ?? null,
                'is_featured' => ! empty($validated['is_featured']),
                'is_active' => isset($validated['is_active']) ? (bool) $validated['is_active'] : true,
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
            ]);

            // Sync default variant prices
            $defaultVariant = $product->variants()->first();
            if ($defaultVariant) {
                $defaultVariant->update([
                    'price' => $product->base_price,
                    'sale_price' => $product->sale_price,
                    'sku' => $product->sku,
                ]);
            }

            // Process newly uploaded manual images
            if ($request->hasFile('images')) {
                $existingCount = $product->images()->count();
                $uploadedFiles = $request->file('images');
                foreach ($uploadedFiles as $idx => $file) {
                    if ($file && $file->isValid()) {
                        $processed = $this->imageService->processProductImage($file, $product->slug, $existingCount + $idx);
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $processed['image_path'],
                            'alt_text' => $product->name,
                            'is_primary' => ($existingCount === 0 && $idx === 0),
                            'sort_order' => $existingCount + $idx,
                        ]);
                    }
                }
            } elseif (! empty($validated['primary_image_url'])) {
                $primaryImg = $product->images()->where('is_primary', true)->first();
                if ($primaryImg) {
                    $primaryImg->update(['image_path' => $validated['primary_image_url']]);
                } else {
                    $product->images()->create([
                        'image_path' => $validated['primary_image_url'],
                        'is_primary' => true,
                        'alt_text' => $product->name,
                        'sort_order' => 0,
                    ]);
                }
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Toggle the publication/active status of a product.
     */
    public function toggleStatus(Product $product): RedirectResponse
    {
        $product->update([
            'is_active' => ! $product->is_active,
        ]);

        $statusLabel = $product->is_active ? 'published' : 'unpublished';

        return redirect()->route('admin.products.index')
            ->with('success', "Product {$product->name} is now {$statusLabel}.");
    }

    /**
     * Safely delete or deactivate the product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        // Check if product is tied to historical order items
        $hasOrders = DB::table('order_items')
            ->whereIn('product_variant_id', $product->variants()->pluck('id'))
            ->exists();

        if ($hasOrders) {
            // Cannot physically delete without breaking historical financial references
            $product->update(['is_active' => false]);

            return redirect()->route('admin.products.index')
                ->with('error', 'Product has existing order records and was safely deactivated instead of deleted.');
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Product removed successfully.');
    }
}
