<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CatalogService
{
    /**
     * Get published featured products for the storefront.
     *
     * @return Collection<int, Product>
     */
    public function getFeaturedProducts(int $limit = 8): Collection
    {
        return Product::query()
            ->where('is_active', true)
            ->where('is_featured', true)
            ->with(['category', 'primaryImage', 'images'])
            ->latest()
            ->take($limit)
            ->get();
    }

    /**
     * Get newest arrivals for the storefront.
     *
     * @return Collection<int, Product>
     */
    public function getNewArrivals(int $limit = 8): Collection
    {
        return Product::query()
            ->where('is_active', true)
            ->with(['category', 'primaryImage', 'images'])
            ->latest()
            ->take($limit)
            ->get();
    }

    /**
     * Get visible top-level categories.
     *
     * @return Collection<int, Category>
     */
    public function getVisibleCategories(): Collection
    {
        return Category::query()
            ->where('is_active', true)
            ->withCount(['products' => function (Builder $query) {
                $query->where('is_active', true);
            }])
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Search and filter published products for the customer storefront.
     */
    public function searchStorefrontProducts(
        ?string $search = null,
        ?int $categoryId = null,
        ?string $sort = null,
        ?bool $featuredOnly = false,
        int $perPage = 12
    ): LengthAwarePaginator {
        $query = Product::query()
            ->where('is_active', true)
            ->with(['category', 'primaryImage', 'images', 'variants.inventoryLevel']);

        if (! empty($search)) {
            $term = trim($search);
            $query->where(function (Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('short_description', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%");
            });
        }

        if (! empty($categoryId)) {
            // Include products in this category and all its children
            $categoryIds = Category::where('id', $categoryId)
                ->orWhere('parent_id', $categoryId)
                ->pluck('id');
            $query->whereIn('category_id', $categoryIds);
        }

        if ($featuredOnly) {
            $query->where('is_featured', true);
        }

        match ($sort) {
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            default => $query->latest(),
        };

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Generate a unique slug for a model.
     *
     * @param  class-string<Product|Category>  $modelClass
     */
    public function generateUniqueSlug(string $name, ?int $ignoreId = null, string $modelClass = Product::class): string
    {
        $baseSlug = Str::slug($name) ?: 'item';
        $slug = $baseSlug;
        $counter = 1;

        while ($modelClass::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }

    /**
     * Prevent cyclical parent-child relationships in categories.
     *
     * @throws ValidationException
     */
    public function preventCategoryCycle(int $categoryId, ?int $targetParentId): void
    {
        if (empty($targetParentId)) {
            return;
        }

        if ($categoryId === $targetParentId) {
            throw ValidationException::withMessages([
                'parent_id' => 'A category cannot be its own parent.',
            ]);
        }

        // Trace up the hierarchy of the target parent to check if categoryId is an ancestor
        $currentParent = Category::find($targetParentId);
        while ($currentParent) {
            if ($currentParent->id === $categoryId) {
                throw ValidationException::withMessages([
                    'parent_id' => 'Invalid category hierarchy: Selected parent is already a descendant of this category.',
                ]);
            }

            $currentParent = $currentParent->parent;
        }
    }
}
