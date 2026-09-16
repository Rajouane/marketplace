<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(
            Product::with(['shop', 'category', 'images'])->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'category_id' => 'required|exists:categories,id',
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'prix_promotionnel' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'seuil_alerte' => 'nullable|integer|min:0',
            'marque' => 'nullable|string|max:255',
        ]);

        $product = Product::create([
            'shop_id' => $request->shop_id,
            'category_id' => $request->category_id,
            'nom' => $request->nom,
            'description' => $request->description,
            'prix' => $request->prix,
            'prix_promotionnel' => $request->prix_promotionnel,
            'stock' => $request->stock,
            'seuil_alerte' => $request->seuil_alerte ?? 5,
            'marque' => $request->marque,
            'statut' => 'brouillon',
        ]);

        return response()->json([
            'message' => 'Produit créé avec succès',
            'product' => $product->load(['shop', 'category']),
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json(
            $product->load(['shop', 'category', 'images'])
        );
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'shop_id' => 'sometimes|exists:shops,id',
            'category_id' => 'sometimes|exists:categories,id',
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'sometimes|numeric|min:0',
            'prix_promotionnel' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'seuil_alerte' => 'sometimes|integer|min:0',
            'marque' => 'nullable|string|max:255',
            'statut' => 'sometimes|in:brouillon,en_attente,publie,rejete',
        ]);

        $product->update($request->only([
            'shop_id',
            'category_id',
            'nom',
            'description',
            'prix',
            'prix_promotionnel',
            'stock',
            'seuil_alerte',
            'marque',
            'statut',
        ]));

        return response()->json([
            'message' => 'Produit modifié avec succès',
            'product' => $product->load(['shop', 'category']),
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé avec succès',
        ]);
    }
}