<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Services\CatalogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService
    ) {}

    /**
     * Display the primary customer-facing storefront homepage.
     */
    public function home(Request $request): Response
    {
        return Inertia::render('Welcome', [
            'laravelVersion' => app()->version(),
            'phpVersion' => PHP_VERSION,
            'storeName' => config('ecommerce.store_name', 'Ecommerce Store'),
            'themeConfig' => config('ecommerce.theme', []),
            'featuredProducts' => $this->catalogService->getFeaturedProducts(8),
            'newArrivals' => $this->catalogService->getNewArrivals(8),
            'categories' => $this->catalogService->getVisibleCategories(),
            'heroBanner' => [
                'title' => 'Modern Essentials for Everyday Living',
                'subtitle' => 'Curated premium catalog engineered for quality, function, and comfort.',
                'cta_text' => 'Explore All Products',
                'cta_url' => '/products',
            ],
        ]);
    }

    /**
     * Display the full searchable, filterable product catalog.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $categoryId = $request->query('category') ? (int) $request->query('category') : null;
        $sort = $request->query('sort');
        $featuredOnly = (bool) $request->query('featured');

        $products = $this->catalogService->searchStorefrontProducts(
            $search,
            $categoryId,
            $sort,
            $featuredOnly,
            12
        );

        $categories = $this->catalogService->getVisibleCategories();
        $selectedCategory = $categoryId ? Category::find($categoryId) : null;

        return Inertia::render('Catalog/Index', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategory' => $selectedCategory,
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'sort' => $sort,
                'featured' => $featuredOnly,
            ],
        ]);
    }

    /**
     * Display a specific category page with its products.
     */
    public function category(string $slug): Response
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->with(['children' => fn ($q) => $q->where('is_active', true)])
            ->firstOrFail();

        $products = $this->catalogService->searchStorefrontProducts(
            null,
            $category->id,
            request()->query('sort'),
            false,
            12
        );

        return Inertia::render('Catalog/Category', [
            'category' => $category,
            'subcategories' => $category->children,
            'products' => $products,
            'categories' => $this->catalogService->getVisibleCategories(),
        ]);
    }

    /**
     * Display a specific product detail page.
     */
    public function show(Request $request, string $slug): Response
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'category',
                'brand',
                'images',
                'variants.inventoryLevel',
                'reviews',
            ])
            ->firstOrFail();

        // Related products in the same category
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->with(['primaryImage', 'images'])
            ->take(4)
            ->get();

        return Inertia::render('Catalog/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'categories' => $this->catalogService->getVisibleCategories(),
        ]);
    }
}
