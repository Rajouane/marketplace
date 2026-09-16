<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::count(),

            'shops' => Shop::where(
                'statut',
                'active'
            )->count(),

            'products' => Product::where(
                'statut',
                'publie'
            )->count(),

            'orders' => Order::count(),
        ]);
    }
}