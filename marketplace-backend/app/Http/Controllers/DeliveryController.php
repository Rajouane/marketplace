<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * Liste des livraisons
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role && $user->role->nom === 'Administrateur') {

            return response()->json(
                Delivery::with([
                    'order',
                    'livreur'
                ])
                ->latest()
                ->get()
            );
        }

        return response()->json(
            Delivery::with([
                'order',
                'livreur'
            ])
            ->where('livreur_id', $user->id)
            ->latest()
            ->get()
        );
    }

    /**
     * Afficher une livraison
     */
    public function show(
        Request $request,
        Delivery $delivery
    ) {
        $user = $request->user();

        if (
            $delivery->livreur_id !== $user->id &&
            (!$user->role ||
             $user->role->nom !== 'Administrateur')
        ) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        return response()->json(
            $delivery->load([
                'order',
                'livreur'
            ])
        );
    }

    /**
     * Modifier le statut de livraison
     */
    public function update(
        Request $request,
        Delivery $delivery
    ) {
        $user = $request->user();

        if (
            $delivery->livreur_id !== $user->id &&
            (!$user->role ||
             $user->role->nom !== 'Administrateur')
        ) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $request->validate([
            'statut' => 'required|in:en_attente,recuperee,en_cours,livree,echec',
        ]);

        $delivery->update([
            'statut' => $request->statut,
        ]);

        if ($request->statut === 'livree') {
            $delivery->update([
                'date_livraison' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Statut de livraison modifié',
            'delivery' => $delivery,
        ]);
    }
}