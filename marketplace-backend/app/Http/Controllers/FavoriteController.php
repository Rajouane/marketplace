<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Liste des favoris
     */
    public function index(Request $request)
    {
        return response()->json(
            Favorite::with('product')
                ->where('client_id', $request->user()->id)
                ->latest()
                ->get()
        );
    }

    /**
     * Ajouter aux favoris
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $favorite = Favorite::firstOrCreate([
            'client_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'message' => 'Produit ajouté aux favoris',
            'favorite' => $favorite->load('product'),
        ], 201);
    }

    /**
     * Supprimer des favoris
     */
    public function destroy(Request $request, Favorite $favorite)
    {
        if ($favorite->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Produit supprimé des favoris',
        ]);
    }
}