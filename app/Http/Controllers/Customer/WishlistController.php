<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use App\Services\CatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService
    ) {}

    /**
     * Display customer's bookmarked wishlist.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $wishlistProducts = $user->wishlistProducts()
            ->with(['primaryImage', 'images', 'category'])
            ->latest('wishlists.created_at')
            ->paginate(12);

        return Inertia::render('Customer/Wishlist', [
            'products' => $wishlistProducts,
            'categories' => $this->catalogService->getVisibleCategories(),
        ]);
    }

    /**
     * Toggle a product in customer's wishlist.
     */
    public function toggle(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Please log in to add items to your wishlist.',
                'authenticated' => false,
            ], 401);
        }

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $inWishlist = false;
            $message = "Removed '{$product->name}' from your wishlist.";
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $inWishlist = true;
            $message = "Added '{$product->name}' to your wishlist!";
        }

        $count = Wishlist::where('user_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'in_wishlist' => $inWishlist,
            'wishlist_count' => $count,
            'message' => $message,
            'authenticated' => true,
        ]);
    }

    /**
     * Check if product is in current customer's wishlist.
     */
    public function status(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'in_wishlist' => false,
            ]);
        }

        $inWishlist = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json([
            'in_wishlist' => $inWishlist,
        ]);
    }
}
