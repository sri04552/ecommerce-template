<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ProductionCleanSeeder::class);

        // In local or testing environments, populate the demo store catalog
        if (app()->environment('local', 'testing')) {
            $this->call(DemoStoreSeeder::class);
        }
    }
}
