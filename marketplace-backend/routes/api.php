<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [
    AuthController::class,
    'register'
]);

Route::post('/login', [
    AuthController::class,
    'login'
]);


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [
        AuthController::class,
        'me'
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Admin Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/dashboard', [
        AdminDashboardController::class,
        'index'
    ])->middleware('role:Administrateur');


    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:Administrateur')->group(function () {

        Route::get('/users', [
            UserController::class,
            'index'
        ]);

        Route::get('/users/{user}', [
            UserController::class,
            'show'
        ]);

        Route::put('/users/{user}', [
            UserController::class,
            'update'
        ]);

        Route::delete('/users/{user}', [
            UserController::class,
            'destroy'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

    Route::get('/categories', [
        CategoryController::class,
        'index'
    ]);

    Route::get('/categories/{category}', [
        CategoryController::class,
        'show'
    ]);

    Route::middleware('role:Administrateur')->group(function () {

        Route::post('/categories', [
            CategoryController::class,
            'store'
        ]);

        Route::put('/categories/{category}', [
            CategoryController::class,
            'update'
        ]);

        Route::delete('/categories/{category}', [
            CategoryController::class,
            'destroy'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Shops
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'shops',
        ShopController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    Route::get('/products', [
        ProductController::class,
        'index'
    ]);

    Route::get('/products/{product}', [
        ProductController::class,
        'show'
    ]);

    Route::middleware('role:Vendeur')->group(function () {

        Route::post('/products', [
            ProductController::class,
            'store'
        ]);

        Route::put('/products/{product}', [
            ProductController::class,
            'update'
        ]);

        Route::delete('/products/{product}', [
            ProductController::class,
            'destroy'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Product Images
    |--------------------------------------------------------------------------
    */

    Route::get('/products/{product}/images', [
        ProductImageController::class,
        'index'
    ]);

    Route::middleware('role:Vendeur,Administrateur')->group(function () {

        Route::post('/products/{product}/images', [
            ProductImageController::class,
            'store'
        ]);

        Route::delete('/product-images/{productImage}', [
            ProductImageController::class,
            'destroy'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Cart
    |--------------------------------------------------------------------------
    */

    Route::get('/cart', [
        CartController::class,
        'index'
    ]);

    Route::post('/cart/items', [
        CartController::class,
        'store'
    ]);

    Route::put('/cart/items/{cartItem}', [
        CartController::class,
        'update'
    ]);

    Route::delete('/cart/items/{cartItem}', [
        CartController::class,
        'destroy'
    ]);

    Route::delete('/cart/clear', [
        CartController::class,
        'clear'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Addresses
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'addresses',
        AddressController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Orders - Client
    |--------------------------------------------------------------------------
    */

    Route::get('/orders', [
        OrderController::class,
        'index'
    ]);

    Route::post('/orders', [
        OrderController::class,
        'store'
    ]);

    Route::get('/orders/{order}', [
        OrderController::class,
        'show'
    ]);

    Route::put('/orders/{order}', [
        OrderController::class,
        'update'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Orders - Vendeur
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:Vendeur')->group(function () {

        Route::get('/vendeur/orders', [
            OrderController::class,
            'sellerOrders'
        ]);

        Route::put('/vendeur/orders/{order}', [
            OrderController::class,
            'sellerUpdateStatus'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */

    Route::get('/orders/{order}/payment', [
        PaymentController::class,
        'show'
    ]);

    Route::post('/orders/{order}/payment', [
        PaymentController::class,
        'store'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Deliveries
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:Administrateur,Livreur')->group(function () {

        Route::get('/deliveries', [
            DeliveryController::class,
            'index'
        ]);

        Route::get('/deliveries/{delivery}', [
            DeliveryController::class,
            'show'
        ]);

        Route::put('/deliveries/{delivery}', [
            DeliveryController::class,
            'update'
        ]);
    });

    Route::middleware('role:Administrateur')->group(function () {

        Route::post('/deliveries', [
            DeliveryController::class,
            'store'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Coupons
    |--------------------------------------------------------------------------
    */

    Route::get('/coupons', [
        CouponController::class,
        'index'
    ]);

    Route::get('/coupons/{code}', [
        CouponController::class,
        'show'
    ]);

    Route::middleware('role:Administrateur')->group(function () {

        Route::post('/coupons', [
            CouponController::class,
            'store'
        ]);

        Route::put('/coupons/{coupon}', [
            CouponController::class,
            'update'
        ]);

        Route::delete('/coupons/{coupon}', [
            CouponController::class,
            'destroy'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Favorites
    |--------------------------------------------------------------------------
    */

    Route::get('/favorites', [
        FavoriteController::class,
        'index'
    ]);

    Route::post('/favorites', [
        FavoriteController::class,
        'store'
    ]);

    Route::delete('/favorites/{favorite}', [
        FavoriteController::class,
        'destroy'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Reviews
    |--------------------------------------------------------------------------
    */

    Route::get('/reviews', [
        ReviewController::class,
        'index'
    ]);

    Route::post('/reviews', [
        ReviewController::class,
        'store'
    ]);

    Route::put('/reviews/{review}', [
        ReviewController::class,
        'update'
    ]);

    Route::delete('/reviews/{review}', [
        ReviewController::class,
        'destroy'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [
        NotificationController::class,
        'index'
    ]);

    Route::get('/notifications/{notification}', [
        NotificationController::class,
        'show'
    ]);

    Route::put('/notifications/{notification}', [
        NotificationController::class,
        'update'
    ]);

    Route::delete('/notifications/{notification}', [
        NotificationController::class,
        'destroy'
    ]);

    Route::post('/notifications/read-all', [
        NotificationController::class,
        'markAllAsRead'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Commissions
    |--------------------------------------------------------------------------
    */

    Route::get('/commissions', [
        CommissionController::class,
        'index'
    ]);

    Route::get('/commissions/{commission}', [
        CommissionController::class,
        'show'
    ]);

    Route::middleware('role:Administrateur')->group(function () {

        Route::post('/commissions', [
            CommissionController::class,
            'store'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Admin Test
    |--------------------------------------------------------------------------
    */

    Route::get('/admin-test', function () {

        return response()->json([
            'message' =>
                'Bienvenue Administrateur',
        ]);

    })->middleware('role:Administrateur');
});