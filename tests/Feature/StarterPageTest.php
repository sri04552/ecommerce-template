<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StarterPageTest extends TestCase
{
    /**
     * Test that the starter home page renders successfully with Inertia.
     */
    public function test_starter_page_renders_with_inertia(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('laravelVersion')
            ->has('phpVersion')
            ->has('storeName')
            ->has('themeConfig')
        );
    }
}
