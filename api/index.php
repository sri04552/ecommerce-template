<?php

use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

define('LARAVEL_START', microtime(true));

// Setup writable /tmp paths for serverless execution
$tmp = '/tmp';
$storageDirs = [
    $tmp.'/storage/framework/views',
    $tmp.'/storage/framework/cache/data',
    $tmp.'/storage/framework/sessions',
    $tmp.'/storage/logs',
    $tmp.'/bootstrap/cache',
];

foreach ($storageDirs as $dir) {
    if (! is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Redirect cache and view compile paths to writable /tmp
putenv('VIEW_COMPILED_PATH='.$tmp.'/storage/framework/views');
putenv('APP_CONFIG_CACHE='.$tmp.'/bootstrap/cache/config.php');
putenv('APP_EVENTS_CACHE='.$tmp.'/bootstrap/cache/events.php');
putenv('APP_PACKAGES_CACHE='.$tmp.'/bootstrap/cache/packages.php');
putenv('APP_ROUTES_CACHE='.$tmp.'/bootstrap/cache/routes.php');
putenv('APP_SERVICES_CACHE='.$tmp.'/bootstrap/cache/services.php');

// Database configuration for serverless preview
$dbConnection = getenv('DB_CONNECTION') ?: 'sqlite';
if ($dbConnection === 'sqlite') {
    $dbPath = $tmp.'/database.sqlite';
    putenv('DB_CONNECTION=sqlite');
    putenv('DB_DATABASE='.$dbPath);
    $_ENV['DB_CONNECTION'] = 'sqlite';
    $_ENV['DB_DATABASE'] = $dbPath;

    if (! file_exists($dbPath)) {
        touch($dbPath);
    }
}

// Maintenance mode check
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

// Bootstrap Console Kernel to properly set facade roots and application state
$consoleKernel = $app->make(ConsoleKernel::class);
$consoleKernel->bootstrap();

// If SQLite database does not have tables initialized yet, run migrations and seeds
if ($dbConnection === 'sqlite') {
    try {
        if (! Schema::hasTable('store_settings')) {
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\ProductionCleanSeeder', '--force' => true]);
            Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\DemoStoreSeeder', '--force' => true]);
        }
    } catch (Throwable $e) {
        error_log('Initial serverless database setup: '.$e->getMessage());
    }
}

$app->handleRequest(Request::capture());
