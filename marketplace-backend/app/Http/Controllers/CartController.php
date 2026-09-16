<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Afficher le panier du client connecté
     */
    public function index(Request $request)
    {
        $cart = Cart::with([
            'items.product.shop',
            'items.product.category'
        ])->firstOrCreate([
            'client_id' => $request->user()->id,
        ]);

        return response()->json($cart);
    }

    /**
     * Ajouter un produit au panier
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantite' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantite) {
            return response()->json([
                'message' => 'Stock insuffisant',
            ], 422);
        }

        $cart = Cart::firstOrCreate([
            'client_id' => $request->user()->id,
        ]);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $item->quantite += $request->quantite;
            $item->save();
        } else {
            $item = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantite' => $request->quantite,
            ]);
        }

        return response()->json([
            'message' => 'Produit ajouté au panier',
            'item' => $item->load('product'),
        ], 201);
    }

    /**
     * Modifier la quantité
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $request->validate([
            'quantite' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('client_id', $request->user()->id)
            ->findOrFail($cartItem->cart_id);

        if ($cartItem->product->stock < $request->quantite) {
            return response()->json([
                'message' => 'Stock insuffisant',
            ], 422);
        }

        $cartItem->update([
            'quantite' => $request->quantite,
        ]);

        return response()->json([
            'message' => 'Quantité modifiée',
            'item' => $cartItem->load('product'),
        ]);
    }

    /**
     * Supprimer un produit du panier
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        Cart::where('client_id', $request->user()->id)
            ->findOrFail($cartItem->cart_id);

        $cartItem->delete();

        return response()->json([
            'message' => 'Produit supprimé du panier',
        ]);
    }

    /**
     * Vider le panier
     */
    public function clear(Request $request)
    {
        $cart = Cart::where('client_id', $request->user()->id)
            ->firstOrFail();

        $cart->items()->delete();

        return response()->json([
            'message' => 'Panier vidé',
        ]);
    }
}