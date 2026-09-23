<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Notification;
use App\Models\User;
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
                    'livreur',
                ])
                ->latest()
                ->get()
            );
        }

        return response()->json(
            Delivery::with([
                'order',
                'livreur',
            ])
            ->where('livreur_id', $user->id)
            ->latest()
            ->get()
        );
    }

    /**
     * Créer et affecter une livraison
     */
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'livreur_id' => 'required|exists:users,id',
        ]);

        $livreur = User::with('role')
            ->find($request->livreur_id);

        if (
            !$livreur ||
            !$livreur->role ||
            $livreur->role->nom !== 'Livreur'
        ) {
            return response()->json([
                'message' => 'L\'utilisateur sélectionné n\'est pas un livreur.',
            ], 422);
        }

        $existingDelivery = Delivery::where(
            'order_id',
            $request->order_id
        )->first();

        if ($existingDelivery) {
            return response()->json([
                'message' => 'Cette commande possède déjà une livraison.',
            ], 422);
        }

        $delivery = Delivery::create([
            'order_id' => $request->order_id,
            'livreur_id' => $livreur->id,
            'statut' => 'en_attente',
            'date_affectation' => now(),
        ]);

        Notification::create([
            'user_id' => $livreur->id,
            'type' => 'livraison',
            'titre' => 'Nouvelle livraison',
            'contenu' => 'Une nouvelle livraison vous a été affectée.',
            'lu' => false,
        ]);

        return response()->json([
            'message' => 'Livraison affectée avec succès.',
            'delivery' => $delivery->load([
                'order',
                'livreur',
            ]),
        ], 201);
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
                'livreur',
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

            $delivery->load('order.client');

            if ($delivery->order) {
                $delivery->order->update([
                    'statut' => 'livree',
                ]);

                if ($delivery->order->client) {
                    Notification::create([
                        'user_id' => $delivery->order->client->id,
                        'type' => 'livraison',
                        'titre' => 'Commande livrée',
                        'contenu' => 'Votre commande a été livrée avec succès.',
                        'lu' => false,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Statut de livraison modifié',
            'delivery' => $delivery->load([
                'order',
                'livreur',
            ]),
        ]);
    }
}