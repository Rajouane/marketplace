<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index()
    {
        return response()->json(
            Shop::with('vendeur')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $shop = Shop::create([
            'vendeur_id' => $request->user()->id,
            'nom' => $request->nom,
            'description' => $request->description,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'message' => 'Boutique créée avec succès',
            'shop' => $shop,
        ], 201);
    }

    public function show(Shop $shop)
    {
        return response()->json(
            $shop->load('vendeur', 'products')
        );
    }

    public function update(Request $request, Shop $shop)
    {
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'statut' => 'sometimes|in:en_attente,active,suspendue',
        ]);

        $shop->update($request->only([
            'nom',
            'description',
            'statut',
        ]));

        return response()->json([
            'message' => 'Boutique modifiée avec succès',
            'shop' => $shop,
        ]);
    }

    public function destroy(Shop $shop)
    {
        $shop->delete();

        return response()->json([
            'message' => 'Boutique supprimée avec succès',
        ]);
    }
}