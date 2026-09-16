<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | CLIENT - Liste des commandes
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $orders = Order::with([
            'client',
            'items.product',
            'items.shop',
            'address',
            'payment',
            'delivery',
        ])
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /*
    |--------------------------------------------------------------------------
    | CLIENT - Créer une commande
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $request->validate([
            'address_id' => 'required|exists:addresses,id',
        ]);

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Vérifier l'adresse
        |--------------------------------------------------------------------------
        */

        $address = Address::where('id', $request->address_id)
            ->where('client_id', $user->id)
            ->first();

        if (!$address) {
            return response()->json([
                'message' => 'Cette adresse ne vous appartient pas.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Récupérer le panier
        |--------------------------------------------------------------------------
        */

        $cart = Cart::with([
            'items.product.shop',
            'items.product.images',
        ])
            ->where('client_id', $user->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Le panier est vide.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier les produits et le stock
        |--------------------------------------------------------------------------
        */

        foreach ($cart->items as $item) {
            if (!$item->product) {
                return response()->json([
                    'message' => 'Un produit du panier est introuvable.',
                ], 422);
            }

            if ($item->product->stock < $item->quantite) {
                return response()->json([
                    'message' =>
                        "Stock insuffisant pour le produit : {$item->product->nom}",
                ], 422);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Créer la commande dans une transaction
        |--------------------------------------------------------------------------
        */

        $order = DB::transaction(function () use (
            $user,
            $address,
            $cart
        ) {
            $sousTotal = 0;

            /*
            |--------------------------------------------------------------------------
            | Calcul du sous-total
            |--------------------------------------------------------------------------
            */

            foreach ($cart->items as $item) {
                $prixNormal = (float) $item->product->prix;

                $prixPromotionnel =
                    $item->product->prix_promotionnel !== null
                        ? (float) $item->product->prix_promotionnel
                        : null;

                if (
                    $prixPromotionnel !== null &&
                    $prixPromotionnel > 0 &&
                    $prixPromotionnel < $prixNormal
                ) {
                    $prix = $prixPromotionnel;
                } else {
                    $prix = $prixNormal;
                }

                $sousTotal += $prix * $item->quantite;
            }

            /*
            |--------------------------------------------------------------------------
            | Frais et total
            |--------------------------------------------------------------------------
            */

            $fraisLivraison = 30;
            $reduction = 0;

            $total =
                $sousTotal +
                $fraisLivraison -
                $reduction;

            /*
            |--------------------------------------------------------------------------
            | Créer la commande
            |--------------------------------------------------------------------------
            */

            $order = Order::create([
                'numero' =>
                    'CMD-' .
                    strtoupper(Str::random(8)),

                'client_id' =>
                    $user->id,

                'address_id' =>
                    $address->id,

                'sous_total' =>
                    $sousTotal,

                'frais_livraison' =>
                    $fraisLivraison,

                'reduction' =>
                    $reduction,

                'total' =>
                    $total,

                'statut' =>
                    'en_attente',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Créer les lignes de commande
            |--------------------------------------------------------------------------
            */

            foreach ($cart->items as $item) {
                $prixNormal = (float) $item->product->prix;

                $prixPromotionnel =
                    $item->product->prix_promotionnel !== null
                        ? (float) $item->product->prix_promotionnel
                        : null;

                if (
                    $prixPromotionnel !== null &&
                    $prixPromotionnel > 0 &&
                    $prixPromotionnel < $prixNormal
                ) {
                    $prix = $prixPromotionnel;
                } else {
                    $prix = $prixNormal;
                }

                OrderItem::create([
                    'order_id' =>
                        $order->id,

                    'product_id' =>
                        $item->product_id,

                    'shop_id' =>
                        $item->product->shop_id,

                    'quantite' =>
                        $item->quantite,

                    'prix_unitaire' =>
                        $prix,

                    'total' =>
                        $prix * $item->quantite,
                ]);

                /*
                |--------------------------------------------------------------------------
                | Diminuer le stock
                |--------------------------------------------------------------------------
                */

                $item->product->decrement(
                    'stock',
                    $item->quantite
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Paiement à la livraison
            |--------------------------------------------------------------------------
            */

            Payment::create([
                'order_id' =>
                    $order->id,

                'mode' =>
                    'paiement_a_la_livraison',

                'statut' =>
                    'en_attente',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Vider le panier
            |--------------------------------------------------------------------------
            */

            $cart->items()->delete();

            return $order;
        });

        /*
        |--------------------------------------------------------------------------
        | Réponse
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
                'Commande créée avec succès.',

            'order' =>
                $order->load([
                    'client',
                    'items.product',
                    'items.shop',
                    'address',
                    'payment',
                    'delivery',
                ]),
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | CLIENT - Afficher une commande
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        Order $order
    ) {
        if (
            $order->client_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'Accès non autorisé.',
            ], 403);
        }

        return response()->json(
            $order->load([
                'client',
                'items.product',
                'items.shop',
                'address',
                'payment',
                'delivery',
            ])
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CLIENT - Annuler une commande
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Order $order
    ) {
        if (
            $order->client_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'Accès non autorisé.',
            ], 403);
        }

        if (
            !in_array(
                $order->statut,
                [
                    'en_attente',
                    'confirmee',
                ],
                true
            )
        ) {
            return response()->json([
                'message' =>
                    'Cette commande ne peut plus être annulée.',
            ], 422);
        }

        $order->update([
            'statut' => 'annulee',
        ]);

        return response()->json([
            'message' =>
                'Commande annulée.',

            'order' =>
                $order->load([
                    'client',
                    'items.product',
                    'items.shop',
                    'address',
                    'payment',
                    'delivery',
                ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | VENDEUR - Liste des commandes
    |--------------------------------------------------------------------------
    */

    public function sellerOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::with([
            'client',
            'items.product',
            'items.shop',
            'address',
            'payment',
            'delivery',
        ])
            ->whereHas(
                'items.shop',
                function ($query) use ($user) {
                    $query->where(
                        'vendeur_id',
                        $user->id
                    );
                }
            )
            ->latest()
            ->get();

        return response()->json($orders);
    }

    /*
    |--------------------------------------------------------------------------
    | VENDEUR - Modifier le statut d'une commande
    |--------------------------------------------------------------------------
    */

    public function sellerUpdateStatus(
        Request $request,
        Order $order
    ) {
        $user = $request->user();

        $request->validate([
            'statut' => [
                'required',
                'in:en_attente,confirmee,preparee,expediee,livree',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Vérifier que la commande contient
        | un produit appartenant au vendeur
        |--------------------------------------------------------------------------
        */

        $isSellerOrder = $order
            ->items()
            ->whereHas(
                'shop',
                function ($query) use ($user) {
                    $query->where(
                        'vendeur_id',
                        $user->id
                    );
                }
            )
            ->exists();

        if (!$isSellerOrder) {
            return response()->json([
                'message' =>
                    'Vous n\'êtes pas autorisé à modifier cette commande.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Modifier le statut
        |--------------------------------------------------------------------------
        */

        $order->update([
            'statut' =>
                $request->statut,
        ]);

        return response()->json([
            'message' =>
                'Statut de la commande modifié avec succès.',

            'order' =>
                $order->load([
                    'client',
                    'items.product',
                    'items.shop',
                    'address',
                    'payment',
                    'delivery',
                ]),
        ]);
    }
}