<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\ProductionCleanSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProductionCleanSeeder::class);

        $adminRole = Role::where('name', 'admin')->first();
        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);
    }

    public function test_admin_can_view_category_listing(): void
    {
        $parent = Category::create([
            'name' => 'Footwear',
            'slug' => 'footwear',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Boots',
            'slug' => 'boots',
            'parent_id' => $parent->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->get('/admin/categories');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Categories/Index')
            ->has('categories', 1)
            ->where('categories.0.name', 'Footwear')
            ->has('categories.0.children', 1)
        );
    }

    public function test_admin_can_create_category(): void
    {
        $response = $this->actingAs($this->adminUser)->post('/admin/categories', [
            'name' => 'Home & Living',
            'description' => 'Decor and accessories',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $response->assertRedirect('/admin/categories');
        $this->assertDatabaseHas('categories', [
            'name' => 'Home & Living',
            'slug' => 'home-living',
        ]);
    }

    public function test_admin_cannot_create_cyclic_category_hierarchy(): void
    {
        $grandparent = Category::create(['name' => 'A', 'slug' => 'cat-a', 'is_active' => true]);
        $parent = Category::create(['name' => 'B', 'slug' => 'cat-b', 'parent_id' => $grandparent->id, 'is_active' => true]);
        $child = Category::create(['name' => 'C', 'slug' => 'cat-c', 'parent_id' => $parent->id, 'is_active' => true]);

        // Attempt to make grandparent a child of its own grandchild (child)
        $response = $this->actingAs($this->adminUser)->put("/admin/categories/{$grandparent->id}", [
            'name' => 'A Updated',
            'slug' => 'cat-a',
            'parent_id' => $child->id,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors(['parent_id']);
    }

    public function test_cannot_delete_category_with_products(): void
    {
        $category = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Laptop Stand',
            'slug' => 'laptop-stand',
            'sku' => 'STND-01',
            'category_id' => $category->id,
            'base_price' => 39.99,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->delete("/admin/categories/{$category->id}");

        $response->assertRedirect('/admin/categories');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_cannot_delete_category_with_subcategories(): void
    {
        $parent = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Jackets',
            'slug' => 'jackets',
            'parent_id' => $parent->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->delete("/admin/categories/{$parent->id}");

        $response->assertRedirect('/admin/categories');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('categories', ['id' => $parent->id]);
    }
}
