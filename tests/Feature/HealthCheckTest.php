<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test that the Laravel application health endpoint returns 200 OK.
     */
    public function test_health_check_endpoint_returns_ok(): void
    {
        $response = $this->get('/up');

        $response->assertStatus(200);
    }
}
