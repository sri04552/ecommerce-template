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
3. **No Predictable Credentials:** Default predictable administrator credentials are strictly prohibited.
4. **Zero Secrets in Source Control:** `.env` is ignored by Git; `.env.example` provides documented environment keys without values.

---

## System Requirements

- **PHP:** `^8.2` (PHP 8.2, 8.3, 8.4 supported)
- **Required PHP Extensions:** `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `curl`, `fileinfo`, `zip`, `intl`, `gd` or `imagick`, `bcmath`
- **Composer:** `^2.0`
- **Node.js:** `^18.0` or higher (`v24.19.0` tested)
- **NPM:** `^9.0` or higher (`11.17.0` tested)

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

### 3. Database Migration
Configure your database connection in `.env` (default is SQLite for immediate zero-config testing):
```bash
php artisan migrate
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
# Run PHPUnit / Pest automated test suite
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
