<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Liste des avis publiés
     */
    public function index(Request $request)
    {
        $query = Review::with([
            'client',
            'product'
        ])->where('statut', 'publie');

        if ($request->has('product_id')) {
            $query->where(
                'product_id',
                $request->product_id
            );
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    /**
     * Ajouter un avis
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string',
        ]);

        $review = Review::updateOrCreate(
            [
                'client_id' => $request->user()->id,
                'product_id' => $request->product_id,
            ],
            [
                'note' => $request->note,
                'commentaire' => $request->commentaire,
                'statut' => 'en_attente',
            ]
        );

        return response()->json([
            'message' => 'Avis envoyé pour validation',
            'review' => $review,
        ], 201);
    }

    /**
     * Modifier un avis
     */
    public function update(Request $request, Review $review)
    {
        if ($review->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $request->validate([
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string',
        ]);

        $review->update([
            'note' => $request->note,
            'commentaire' => $request->commentaire,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'message' => 'Avis modifié',
            'review' => $review,
        ]);
    }

    /**
     * Supprimer un avis
     */
    public function destroy(Request $request, Review $review)
    {
        if ($review->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Avis supprimé',
        ]);
    }
}