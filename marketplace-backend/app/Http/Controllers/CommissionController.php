<?php

namespace App\Http\Controllers;

use App\Models\Commission;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    /**
     * Liste des commissions
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role && $user->role->nom === 'Administrateur') {

            return response()->json(
                Commission::with([
                    'order',
                    'vendeur'
                ])
                ->latest()
                ->get()
            );
        }

        return response()->json(
            Commission::with([
                'order'
            ])
            ->where('vendeur_id', $user->id)
            ->latest()
            ->get()
        );
    }

    /**
     * Afficher une commission
     */
    public function show(
        Request $request,
        Commission $commission
    ) {
        $user = $request->user();

        if (
            $commission->vendeur_id !== $user->id &&
            (!$user->role ||
             $user->role->nom !== 'Administrateur')
        ) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        return response()->json(
            $commission->load([
                'order',
                'vendeur'
            ])
        );
    }

    /**
     * Créer une commission
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'vendeur_id' => 'required|exists:users,id',
            'taux' => 'required|numeric|min:0|max:100',
            'montant' => 'required|numeric|min:0',
        ]);

        $commission = Commission::create([
            'order_id' => $request->order_id,
            'vendeur_id' => $request->vendeur_id,
            'taux' => $request->taux,
            'montant' => $request->montant,
        ]);

        return response()->json([
            'message' => 'Commission créée avec succès',
            'commission' => $commission,
        ], 201);
    }
}