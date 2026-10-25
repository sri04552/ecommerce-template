<?php

namespace Tests\Feature;

use Tests\TestCase;

class ServerlessDatabaseConfigTest extends TestCase
{
    public function test_api_entrypoint_fails_safely_when_persistent_database_missing_on_auth_routes(): void
    {
        // When simulated behind Vercel serverless without persistent DB credentials,
        // visiting /login or /register returns HTTP 503 instead of creating an ephemeral database.
        $tmp = sys_get_temp_dir();
        $entrypoint = base_path('api/index.php');

        // Test PHP command line simulation of serverless request to auth route
        $output = [];
        $returnCode = 0;

        $cmd = sprintf(
            'php -r "putenv(\'VERCEL=1\'); putenv(\'DB_CONNECTION=sqlite\'); $_SERVER[\'REQUEST_URI\'] = \'/login\'; include \'%s\';"',
            addslashes($entrypoint)
        );

        exec($cmd, $output, $returnCode);

        $responseString = implode("\n", $output);
        $this->assertStringContainsString('Persistent Database Required', $responseString);
        $this->assertStringContainsString('DB_CONNECTION=mysql', $responseString);
    }
}
