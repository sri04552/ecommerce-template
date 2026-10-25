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

// Session configuration: Use encrypted cookie sessions on serverless to maintain state across invocations
if (! getenv('SESSION_DRIVER')) {
    putenv('SESSION_DRIVER=cookie');
    $_ENV['SESSION_DRIVER'] = 'cookie';
}

// Verify persistent database configuration on Vercel
$dbConnection = getenv('DB_CONNECTION') ?: '';
$dbHost = getenv('DB_HOST') ?: '';
$hasPersistentDb = in_array($dbConnection, ['mysql', 'mariadb'], true) && ! empty($dbHost);

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestPath = parse_url($requestUri, PHP_URL_PATH) ?: '/';

// Block customer authentication and profile operations when persistent database is missing on Vercel
$isAuthRoute = (bool) preg_match('#^/(register|login|logout|account|auth|email|forgot-password|reset-password)#', $requestPath);

if (! $hasPersistentDb && $isAuthRoute) {
    http_response_code(503);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Database Configuration Required</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
        .card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; max-width: 32rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        h1 { font-size: 1.25rem; font-weight: 700; color: #b91c1c; margin-top: 0; margin-bottom: 0.75rem; }
        p { font-size: 0.875rem; line-height: 1.5; color: #475569; margin-bottom: 1rem; }
        code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.8125rem; color: #0f172a; }
        ul { font-size: 0.8125rem; color: #334155; padding-left: 1.25rem; margin-bottom: 1.25rem; }
        li { margin-bottom: 0.25rem; }
        .back-link { display: inline-block; font-size: 0.875rem; font-weight: 600; color: #2563eb; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Persistent Database Required</h1>
        <p>In compliance with production data integrity policies, <strong>ephemeral <code>/tmp</code> SQLite storage has been disabled</strong> for deployed customer authentication, profiles, and order records.</p>
        <p>To enable customer registration and login on this deployment, configure an external MySQL or MariaDB instance in Vercel environment variables:</p>
        <ul>
            <li><code>DB_CONNECTION=mysql</code></li>
            <li><code>DB_HOST=your-mysql-host.example.com</code></li>
            <li><code>DB_PORT=3306</code></li>
            <li><code>DB_DATABASE=your_database</code></li>
            <li><code>DB_USERNAME=your_username</code></li>
            <li><code>DB_PASSWORD=your_password</code></li>
        </ul>
        <a href="/" class="back-link">&larr; Return to Storefront Home</a>
    </div>
</body>
</html>';
    exit;
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

// Bootstrap Console Kernel
$consoleKernel = $app->make(ConsoleKernel::class);
$consoleKernel->bootstrap();

// If persistent MySQL database is connected, ensure schema is up to date (safe, non-destructive)
if ($hasPersistentDb) {
    try {
        if (! Schema::hasTable('store_settings')) {
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\ProductionCleanSeeder', '--force' => true]);
        }
    } catch (Throwable $e) {
        error_log('Persistent database setup: '.$e->getMessage());
    }
}

$app->handleRequest(Request::capture());
