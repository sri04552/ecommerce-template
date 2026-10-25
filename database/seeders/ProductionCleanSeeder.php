<?php

namespace Database\Seeders;

use App\Facades\Setting;
use App\Models\Page;
use App\Models\Permission;
use App\Models\Role;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionCleanSeeder extends Seeder
{
    /**
     * Run the production clean initialization seed.
     * Seeds essential roles, permissions, baseline settings, and shipping methods.
     * NEVER creates predictable production administrator credentials.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Roles
            $superAdminRole = Role::firstOrCreate(['name' => 'super_admin'], [
                'display_name' => 'Super Administrator',
                'description' => 'Full control over store operations, configuration, and security.',
            ]);

            $adminRole = Role::firstOrCreate(['name' => 'admin'], [
                'display_name' => 'Administrator',
                'description' => 'Store administrator with catalog, order, and customer management.',
            ]);

            $managerRole = Role::firstOrCreate(['name' => 'manager'], [
                'display_name' => 'Store Manager',
                'description' => 'Operational management of catalog, stock, and orders.',
            ]);

            $customerRole = Role::firstOrCreate(['name' => 'customer'], [
                'display_name' => 'Customer',
                'description' => 'Standard storefront purchasing customer.',
            ]);

            // 2. Core Permissions
            $permissions = [
                // Catalog
                ['name' => 'catalog.view', 'display_name' => 'View Catalog', 'group' => 'catalog'],
                ['name' => 'catalog.create', 'display_name' => 'Create Products & Categories', 'group' => 'catalog'],
                ['name' => 'catalog.edit', 'display_name' => 'Edit Products & Categories', 'group' => 'catalog'],
                ['name' => 'catalog.delete', 'display_name' => 'Delete Products & Categories', 'group' => 'catalog'],
                // Orders
                ['name' => 'orders.view', 'display_name' => 'View Orders', 'group' => 'orders'],
                ['name' => 'orders.edit', 'display_name' => 'Update Order Status', 'group' => 'orders'],
                ['name' => 'orders.shipment', 'display_name' => 'Manage Shipments', 'group' => 'orders'],
                // Customers
                ['name' => 'customers.view', 'display_name' => 'View Customer Accounts', 'group' => 'customers'],
                ['name' => 'customers.edit', 'display_name' => 'Edit Customer Accounts', 'group' => 'customers'],
                // Marketing
                ['name' => 'marketing.manage', 'display_name' => 'Manage Coupons & Banners', 'group' => 'marketing'],
                // Settings
                ['name' => 'settings.view', 'display_name' => 'View Store Settings', 'group' => 'settings'],
                ['name' => 'settings.edit', 'display_name' => 'Modify Store Settings', 'group' => 'settings'],
            ];

            $allPermissionIds = [];
            foreach ($permissions as $perm) {
                $permissionModel = Permission::firstOrCreate(['name' => $perm['name']], $perm);
                $allPermissionIds[] = $permissionModel->id;
            }

            // Sync permissions to super_admin and admin
            $superAdminRole->permissions()->sync($allPermissionIds);
            $adminRole->permissions()->sync($allPermissionIds);

            // Store Manager permissions (catalog, orders, customers)
            $managerPermissionIds = Permission::whereIn('group', ['catalog', 'orders', 'customers'])->pluck('id');
            $managerRole->permissions()->sync($managerPermissionIds);

            // 3. Baseline Store Settings
            Setting::setMany([
                'store_name' => config('ecommerce.store_name', 'Ecommerce Store'),
                'store_email' => 'support@example.com',
                'store_phone' => '+91 98765 43210',
                'store_currency' => config('ecommerce.currency', 'INR'),
                'store_currency_symbol' => config('ecommerce.currency_symbol', '₹'),
                'active_theme' => config('ecommerce.theme.active', 'modern'),
                'theme_primary_color' => config('ecommerce.theme.primary_color', '#2563eb'),
                'theme_primary_hover' => config('ecommerce.theme.primary_hover', '#1d4ed8'),
                'theme_secondary_color' => config('ecommerce.theme.secondary_color', '#0f172a'),
                'theme_accent_color' => config('ecommerce.theme.accent_color', '#f59e0b'),
                'theme_border_radius' => config('ecommerce.theme.border_radius', '0.5rem'),
            ], 'general');

            // 4. Default Shipping Methods
            ShippingMethod::firstOrCreate(['code' => 'standard'], [
                'name' => 'Standard Delivery (All India)',
                'base_cost' => 99.00,
                'per_item_cost' => 0.00,
                'free_shipping_threshold' => 999.00,
                'estimated_days_min' => 2,
                'estimated_days_max' => 5,
                'is_active' => true,
            ]);

            ShippingMethod::firstOrCreate(['code' => 'express'], [
                'name' => 'Express Priority Shipping',
                'base_cost' => 15.00,
                'per_item_cost' => 2.00,
                'free_shipping_threshold' => null,
                'estimated_days_min' => 1,
                'estimated_days_max' => 2,
                'is_active' => true,
            ]);

            // 5. Standard CMS Pages
            Page::firstOrCreate(['slug' => 'about-us'], [
                'title' => 'About Us',
                'content' => '<h1>About Our Store</h1><p>We provide high quality products with dedicated customer support.</p>',
                'is_published' => true,
                'meta_title' => 'About Us - Our Story',
                'meta_description' => 'Learn more about our company, vision, and values.',
            ]);

            Page::firstOrCreate(['slug' => 'terms-and-conditions'], [
                'title' => 'Terms and Conditions',
                'content' => '<h1>Terms and Conditions</h1><p>Standard terms and conditions of purchase.</p>',
                'is_published' => true,
                'meta_title' => 'Terms and Conditions',
                'meta_description' => 'Review the terms and conditions governing purchases on our store.',
            ]);

            Page::firstOrCreate(['slug' => 'privacy-policy'], [
                'title' => 'Privacy Policy',
                'content' => '<h1>Privacy Policy</h1><p>Your privacy and security are paramount to us.</p>',
                'is_published' => true,
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Information on how we handle and protect customer personal data.',
            ]);

            // 6. Administrator Account: Strictly NON-PREDICTABLE
            // Only created if explicitly provided via environment variables during deployment.
            // Never hardcodes "admin@example.com" or "password".
            $adminEmail = env('ADMIN_EMAIL');
            $adminPassword = env('ADMIN_PASSWORD');

            if ($adminEmail && $adminPassword) {
                $adminUser = User::firstOrCreate(['email' => $adminEmail], [
                    'name' => env('ADMIN_NAME', 'Store Administrator'),
                    'password' => $adminPassword,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]);

                if (! $adminUser->roles->contains('name', 'super_admin')) {
                    $adminUser->roles()->attach($superAdminRole);
                }
            }
        });
    }
}
