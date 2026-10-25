/**
 * Client-Side Shopping Cart Utility with Strict 20-Product Limit
 */

export const MAX_CART_LIMIT = 20;
const STORAGE_KEY = 'aura_store_cart_v1';
const EVENT_NAME = 'aura-cart-updated';

/**
 * Get all current cart items from localStorage
 */
export function getCart() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse cart storage:', e);
        return [];
    }
}

/**
 * Get total quantity count across all items in cart
 */
export function getCartCount() {
    const items = getCart();
    return items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
}

/**
 * Save cart items and dispatch cross-component sync event
 */
export function saveCart(items) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(
            new CustomEvent(EVENT_NAME, {
                detail: { items, count: getCartCount() },
            })
        );
    } catch (e) {
        console.error('Failed to save cart storage:', e);
    }
}

/**
 * Add a product/variant to the cart with strict 20-item cap
 *
 * @param {Object} product
 * @param {Object|null} variant
 * @param {number} requestedQuantity
 * @returns {{ success: boolean, reason?: string, availableSlots?: number, totalItems: number, message: string }}
 */
export function addToCart(product, variant = null, requestedQuantity = 1) {
    const qtyToAdd = Math.max(1, parseInt(requestedQuantity, 10) || 1);
    const cart = getCart();
    const currentTotal = cart.reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0);

    // 1. Check if cart is already at maximum limit
    if (currentTotal >= MAX_CART_LIMIT) {
        return {
            success: false,
            reason: 'limit_reached',
            availableSlots: 0,
            totalItems: currentTotal,
            message: `Cart limit reached! You already have ${MAX_CART_LIMIT} products in your cart. You cannot add more products until you remove some items.`,
        };
    }

    // 2. Check if adding requested quantity exceeds the 20-product limit
    if (currentTotal + qtyToAdd > MAX_CART_LIMIT) {
        const availableSlots = MAX_CART_LIMIT - currentTotal;
        return {
            success: false,
            reason: 'exceeds_limit',
            availableSlots,
            totalItems: currentTotal,
            message: `Cannot add ${qtyToAdd} items! Maximum limit is ${MAX_CART_LIMIT} products. You can only add up to ${availableSlots} more item${availableSlots === 1 ? '' : 's'}.`,
        };
    }

    // 3. Add or increment item
    const itemId = variant ? `${product.id}-${variant.id}` : `${product.id}`;
    const existingIndex = cart.findIndex((i) => i.id === itemId);

    const price = variant?.price
        ? parseFloat(variant.price)
        : product.sale_price
        ? parseFloat(product.sale_price)
        : parseFloat(product.base_price);

    const originalPrice = parseFloat(product.base_price);
    const image = product.primary_image?.image_path || product.images?.[0]?.image_path || null;

    if (existingIndex > -1) {
        cart[existingIndex].quantity += qtyToAdd;
    } else {
        cart.push({
            id: itemId,
            productId: product.id,
            variantId: variant?.id || null,
            name: product.name,
            variantTitle: variant?.title || null,
            sku: variant?.sku || product.sku,
            price,
            originalPrice,
            image,
            slug: product.slug,
            quantity: qtyToAdd,
        });
    }

    saveCart(cart);
    const newTotal = currentTotal + qtyToAdd;

    return {
        success: true,
        totalItems: newTotal,
        message: `Added ${qtyToAdd} × "${product.name}${variant?.title ? ` (${variant.title})` : ''}" to your cart. (${newTotal}/${MAX_CART_LIMIT} items)`,
    };
}

/**
 * Update item quantity with strict limit enforcement
 */
export function updateQuantity(itemId, newQuantity) {
    const qty = parseInt(newQuantity, 10);
    const cart = getCart();
    const itemIndex = cart.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) {
        return { success: false, message: 'Item not found in cart.' };
    }

    if (qty <= 0) {
        return removeFromCart(itemId);
    }

    const currentItem = cart[itemIndex];
    const otherItemsTotal = cart
        .filter((i) => i.id !== itemId)
        .reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0);

    if (otherItemsTotal + qty > MAX_CART_LIMIT) {
        const maxAllowedForThisItem = MAX_CART_LIMIT - otherItemsTotal;
        return {
            success: false,
            reason: 'exceeds_limit',
            message: `Cannot increase quantity. Maximum cart limit is ${MAX_CART_LIMIT} products (you can set at most ${maxAllowedForThisItem} for this item).`,
        };
    }

    cart[itemIndex].quantity = qty;
    saveCart(cart);

    return {
        success: true,
        totalItems: otherItemsTotal + qty,
        message: 'Cart updated successfully.',
    };
}

/**
 * Remove an item completely from cart
 */
export function removeFromCart(itemId) {
    const cart = getCart().filter((i) => i.id !== itemId);
    saveCart(cart);
    return {
        success: true,
        totalItems: getCartCount(),
        message: 'Item removed from cart.',
    };
}

/**
 * Clear all items from cart
 */
export function clearCart() {
    saveCart([]);
    return {
        success: true,
        totalItems: 0,
        message: 'Cart cleared.',
    };
}

/**
 * React hook / listener helper
 */
export function onCartChange(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => callback(e.detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
}
