/**
 * Client-Side and Server-Synced Customer Wishlist Utility
 * Supports both Guest Users (via localStorage) and Authenticated Customers (synced to database)
 */

const STORAGE_KEY = 'aura_store_wishlist_v1';
const EVENT_NAME = 'aura-wishlist-updated';

/**
 * Get all bookmarked wishlist items from localStorage
 */
export function getLocalWishlist() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse wishlist storage:', e);
        return [];
    }
}

/**
 * Get count of wishlist items
 */
export function getWishlistCount() {
    return getLocalWishlist().length;
}

/**
 * Check if a product ID is currently in the local wishlist
 */
export function isProductInWishlist(productId) {
    if (!productId) return false;
    const items = getLocalWishlist();
    return items.some((item) => String(item.id) === String(productId));
}

/**
 * Save wishlist items to localStorage and notify all components
 */
export function saveLocalWishlist(items) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(
            new CustomEvent(EVENT_NAME, {
                detail: { items, count: items.length },
            })
        );
    } catch (e) {
        console.error('Failed to save wishlist storage:', e);
    }
}

/**
 * Toggle product bookmark in wishlist.
 * Works seamlessly for guest visitors and logged-in users alike.
 */
export async function toggleWishlistItem(product, authUser = null) {
    if (!product || !product.id) return { inWishlist: false, count: 0 };

    const items = getLocalWishlist();
    const existingIndex = items.findIndex((item) => String(item.id) === String(product.id));
    let inWishlist = false;

    if (existingIndex > -1) {
        // Remove from local list
        items.splice(existingIndex, 1);
        inWishlist = false;
    } else {
        // Add minimal required product data for display
        items.unshift({
            id: product.id,
            name: product.name,
            slug: product.slug,
            base_price: product.base_price,
            sale_price: product.sale_price,
            images: product.images || (product.primary_image ? [product.primary_image] : []),
            primary_image: product.primary_image,
            category: product.category,
            delivery_fee: product.delivery_fee,
            cod_available: product.cod_available,
            returnable: product.returnable || product.has_return_exchange,
            return_window_days: product.return_window_days,
            added_at: new Date().toISOString(),
        });
        inWishlist = true;
    }

    // Save locally first for instant, frictionless UI response
    saveLocalWishlist(items);

    // If authenticated, sync with server backend
    if (authUser) {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await fetch(`/api/wishlist/${product.id}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
        } catch (err) {
            console.warn('Wishlist server sync deferred:', err);
        }
    }

    return { inWishlist, count: items.length };
}

/**
 * Remove an item from the wishlist by ID
 */
export async function removeWishlistItem(productId, authUser = null) {
    if (!productId) return;
    const items = getLocalWishlist().filter((item) => String(item.id) !== String(productId));
    saveLocalWishlist(items);

    if (authUser) {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await fetch(`/api/wishlist/${productId}/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
        } catch (err) {
            console.warn('Wishlist server sync deferred:', err);
        }
    }
}
