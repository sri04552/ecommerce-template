# Agency Ecommerce Website Template

A reusable, full-featured, single-tenant e-commerce platform template engineered for web development agencies. Each client deployed from this template receives an independent instance with their own codebase, database, credentials, domain, assets, and branding.

---

## Architecture & Tech Stack

- **Backend Framework:** [Laravel 12](https://laravel.com) (PHP 8.2+ baseline)
- **Frontend Architecture:** [React 19](https://react.dev) with [Inertia.js v3](https://inertiajs.com) (Single Page App UX without API duplication)
- **Styling & Design Tokens:** [Tailwind CSS v4](https://tailwindcss.com) with dynamic CSS variables (`:root`) for live client re-branding
- **Database:** MySQL 8.0+ / MariaDB 10.5+ (SQLite supported for fast local test execution)
- **Hosting Targets:** PHP Shared Hosting (cPanel / LiteSpeed / Apache) and Cloud VPS (Ubuntu / Nginx / Redis)

---

## Mandatory Project Policies

1. **Payment Restriction:** No payment gateway SDKs, live payment processing, or simulated checkout payment flows are active. Payment integration is strictly decoupled and postponed until explicitly authorized.
2. **Single-Tenant Independence:** No multi-tenant SaaS architecture. Each client is deployed independently.
3. **No Predictable Credentials:** Default predictable administrator credentials are strictly prohibited. Production seeders never generate hardcoded admin passwords.
4. **Zero Secrets in Source Control:** `.env` is ignored by Git; `.env.example` provides documented environment keys without values.

---

## System Requirements

- **PHP:** `^8.2` (PHP 8.2, 8.3, 8.4 supported)
- **Required PHP Extensions:** `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `curl`, `fileinfo`, `zip`, `intl`, `gd` or `imagick`, `bcmath`
- **Composer:** `^2.0`
- **Node.js:** `^18.0` or higher (`v24.19.0` tested)
- **NPM:** `^9.0` or higher (`11.17.0` tested)

---

## Database Schema & Data Integrity Design (Phase 2)

The database schema is organized around core domain boundaries with strict non-destructive integrity constraints:

### 1. Identity & RBAC
- `users`: Core identity (Email, Phone, Google OAuth, status).
- `roles` & `permissions`: Role-based access control with pivot tables `role_user` and `permission_role`.
- `customer_profiles`: Extended customer metadata (avatar, birth date, gender, preferences JSON).
- `customer_addresses`: Address book with `(user_id, is_default)` and `(user_id, type)` indexes.

### 2. Catalog & Inventory
- `categories`: Nested self-referencing category tree (`parent_id` with `nullOnDelete`).
- `brands`: Brand directory with unique slugs and active toggles.
- `products`: Product base model with SKU, pricing (`decimal(12, 2)`), variants toggle, and SEO metadata.
- `product_variants`: Variant matrix (SKU, title, price, attributes JSON, weight in grams).
- `product_images`: Media gallery linked to products and optionally to specific variants.
- `inventory_levels`: Stock tracker per variant (`quantity_on_hand`, `reserved_quantity`, `safety_threshold`, `allow_backorder`).
- `inventory_transactions`: Audit ledger for inventory movements (`order`, `adjustment`, `restock`, `cancellation`).

### 3. Shopping Cart
- `carts`: Guest & customer cart supporting `session_token` and `user_id`.
- `cart_items`: Cart items with uniqueness constraint on `(cart_id, product_variant_id)`.

### 4. Orders, Fulfillment & Non-Destructive Integrity
- `orders`: Master order record with `decimal(12, 2)` financial precision.
  - Foreign key `user_id` has `nullOnDelete()`, ensuring that deleting a user account never destroys historical order records.
- `order_items`: Full historical snapshots:
  - `product_name_snapshot`, `variant_title_snapshot`, `variant_attributes_snapshot`, `sku_snapshot`, `unit_price`.
  - Foreign key `product_variant_id` has `nullOnDelete()`, ensuring that updating or archiving catalog products never corrupts historical order line items.
- `order_histories`: Audit trail of state transitions (`from_status`, `to_status`, timestamps, comments).
- `shipping_methods`: Base and per-item shipping cost calculation rules with free shipping thresholds.
- `shipments`: Courier fulfillment records with tracking numbers and dispatch statuses.

### 5. Marketing, Settings & CMS
- `promotions`: Coupon engine supporting percentage and fixed-amount discounts with usage limits and date windows.
- `store_settings`: Key-value store with typed casting (`string`, `boolean`, `integer`, `float`, `json`, `array`) and 24-hour persistent caching.
- `banners`: Responsive storefront banner sliders with placements (`home_hero`, `home_sub`).
- `pages`: Content management for static pages (About Us, Terms, Privacy Policy).

---

## Store Settings & Design Tokens Service

Settings are managed through `App\Facades\Setting` or `App\Services\SettingsService`:

```php
use App\Facades\Setting;

// Retrieve typed settings with fallback
$storeName = Setting::getString('store_name', 'My Store');
$taxRate   = Setting::getFloat('tax_rate', 0.0);
$locales   = Setting::getArray('locales', ['en']);

// Persist a setting (automatically invalidates cache)
Setting::set('theme_primary_color', '#2563eb', 'string');

// Retrieve dynamic CSS brand tokens for blade/themes
$tokens = Setting::getThemeTokens();
// Returns: ['--brand-primary' => '#2563eb', '--brand-radius' => '0.5rem', ...]
```

---

## Database Seeding Strategy

The project separates clean client provisioning from preview demonstration data:

```bash
# 1. Clean Production Initialization (No demo catalog, no predictable admin credentials)
php artisan db:seed --class=ProductionCleanSeeder

# 2. Demo Store Catalog (Categories, brands, products, variants, images, banners, coupons)
php artisan db:seed --class=DemoStoreSeeder

# 3. Default Fresh Migration (Runs ProductionClean + DemoStore in local/testing)
php artisan migrate:fresh --seed
```

---

## Local Development Setup

Follow these exact commands to run the project locally:

### 1. Clone & Configure Environment
```bash
git clone https://github.com/sri04552/ecommerce-template.git
cd ecommerce-template
copy .env.example .env
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Generate application key
php artisan key:generate

# Install Node dependencies
npm install
```

### 3. Database Migration & Seeding
```bash
php artisan migrate:fresh --seed
```

### 4. Build Frontend Assets & Run Dev Servers
In terminal 1 (Laravel backend server):
```bash
php artisan serve
```

In terminal 2 (Vite HMR frontend server):
```bash
npm run dev
```

Visit `http://localhost:8000` in your browser. The application health check is available at `http://localhost:8000/up`.

---

## Code Quality & Automated Testing

Run the full verification suite before committing:

```bash
# Run PHPUnit / Pest automated test suite (19 tests, 87 assertions)
php artisan test

# Run ESLint frontend static analysis
npm run lint

# Format frontend code with Prettier
npm run format

# Run Laravel Pint PHP code style fixer
php vendor/bin/pint --test

# Compile production frontend assets
npm run build
```

---

## Repository & License

- Repository: [sri04552/ecommerce-template](https://github.com/sri04552/ecommerce-template)
- Maintained by Agency Development Team.
