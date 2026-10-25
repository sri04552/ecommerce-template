<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Executive Sales & Analytics Dashboard.
     */
    public function index(Request $request): Response
    {
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();

        // High-level aggregates
        $totalRevenue = (float) Order::where('status', '!=', 'cancelled')->sum('grand_total');
        $todayRevenue = (float) Order::where('status', '!=', 'cancelled')->where('created_at', '>=', $today)->sum('grand_total');
        $monthRevenue = (float) Order::where('status', '!=', 'cancelled')->where('created_at', '>=', $startOfMonth)->sum('grand_total');

        $totalOrdersCount = Order::count();
        $todayOrdersCount = Order::where('created_at', '>=', $today)->count();

        $aov = $totalOrdersCount > 0 ? round($totalRevenue / $totalOrdersCount, 2) : 0.00;

        $pendingShipments = Order::whereIn('status', ['pending', 'processing'])->count();
        $pendingReturns = OrderReturn::where('status', 'requested')->count();
        $totalProducts = Product::count();

        // 7-day sales trend
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayLabel = $date->format('D, d M');
            $dayRevenue = (float) Order::where('status', '!=', 'cancelled')
                ->whereDate('created_at', $date)
                ->sum('grand_total');
            $dayOrders = Order::whereDate('created_at', $date)->count();

            $days[] = [
                'date' => $dayLabel,
                'revenue' => $dayRevenue,
                'orders' => $dayOrders,
            ];
        }

        // Top 5 Selling Products
        $topProducts = OrderItem::select('product_name_snapshot', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(total) as total_earned'))
            ->groupBy('product_name_snapshot')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // Recent 6 Orders
        $recentOrders = Order::latest()
            ->limit(6)
            ->get(['id', 'order_number', 'customer_email', 'status', 'grand_total', 'payment_method', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'today_revenue' => $todayRevenue,
                'month_revenue' => $monthRevenue,
                'total_orders' => $totalOrdersCount,
                'today_orders' => $todayOrdersCount,
                'aov' => $aov,
                'pending_shipments' => $pendingShipments,
                'pending_returns' => $pendingReturns,
                'total_products' => $totalProducts,
            ],
            'trend' => $days,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
        ]);
    }
}
