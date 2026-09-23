<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Liste des commandes
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $user = $request->user();

        if (
            $user->role &&
            $user->role->nom === 'Administrateur'
        ) {
            $orders = Order::with([
                'client',
                'items.product',
                'items.shop',
                'address',
                'payment',
                'delivery',
            ])
                ->latest()
                ->get();

            return response()->json($orders);
        }

        $orders = Order::with([
            'client',
            'items.product',
            'items.shop',
            'address',
            'payment',
            'delivery',
        ])
            ->where('client_id', $user->id)
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

        $address = Address::where('id', $request->address_id)
            ->where('client_id', $user->id)
            ->first();

        if (!$address) {
            return response()->json([
                'message' => 'Cette adresse ne vous appartient pas.',
            ], 403);
        }

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

        $order = DB::transaction(function () use (
            $user,
            $address,
            $cart
        ) {

            $sousTotal = 0;

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

            $fraisLivraison = 30;
            $reduction = 0;

            $total =
                $sousTotal +
                $fraisLivraison -
                $reduction;

            $order = Order::create([
                'numero' =>
                    'CMD-' . strtoupper(Str::random(8)),

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

                $item->product->decrement(
                    'stock',
                    $item->quantite
                );
            }

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
            | Notification du client
            |--------------------------------------------------------------------------
            */

            Notification::create([
                'user_id' =>
                    $user->id,

                'type' =>
                    'commande',

                'titre' =>
                    'Commande créée',

                'contenu' =>
                    'Votre commande ' .
                    $order->numero .
                    ' a été créée avec succès.',

                'lu' =>
                    false,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Notification des vendeurs
            |--------------------------------------------------------------------------
            */

            $vendeurIds = $cart->items
                ->map(function ($item) {
                    return $item->product->shop->vendeur_id;
                })
                ->filter()
                ->unique();

            foreach ($vendeurIds as $vendeurId) {

                Notification::create([
                    'user_id' =>
                        $vendeurId,

                    'type' =>
                        'commande',

                    'titre' =>
                        'Nouvelle commande',

                    'contenu' =>
                        'Vous avez reçu une nouvelle commande ' .
                        $order->numero . '.',

                    'lu' =>
                        false,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Notification des administrateurs
            |--------------------------------------------------------------------------
            */

            $adminIds = User::whereHas('role', function ($query) {
                $query->where('nom', 'Administrateur');
            })
                ->pluck('id');

            foreach ($adminIds as $adminId) {

                Notification::create([
                    'user_id' =>
                        $adminId,

                    'type' =>
                        'commande',

                    'titre' =>
                        'Nouvelle commande',

                    'contenu' =>
                        'Une nouvelle commande ' .
                        $order->numero .
                        ' a été créée.',

                    'lu' =>
                        false,
                ]);
            }

            $cart->items()->delete();

            return $order;
        });

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
    | Afficher une commande
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        Order $order
    ) {
        $user = $request->user();

        if (
            $user->role &&
            $user->role->nom === 'Administrateur'
        ) {
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

        if ($order->client_id !== $user->id) {
            return response()->json([
                'message' => 'Accès non autorisé.',
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
    | CLIENT / ADMIN - Modifier une commande
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Order $order
    ) {
        $user = $request->user();

        if (
            $user->role &&
            $user->role->nom === 'Administrateur'
        ) {

            $request->validate([
                'statut' => [
                    'required',
                    'in:en_attente,confirmee,preparee,expediee,livree,annulee',
                ],
            ]);

            $order->update([
                'statut' =>
                    $request->statut,
            ]);

            Notification::create([
                'user_id' =>
                    $order->client_id,

                'type' =>
                    'commande',

                'titre' =>
                    'Mise à jour de votre commande',

                'contenu' =>
                    'Le statut de votre commande est maintenant : ' .
                    $request->statut,

                'lu' =>
                    false,
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

        if ($order->client_id !== $user->id) {
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
            'statut' =>
                'annulee',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Notification des administrateurs
        |--------------------------------------------------------------------------
        */

        $adminIds = User::whereHas('role', function ($query) {
            $query->where('nom', 'Administrateur');
        })
            ->pluck('id');

        foreach ($adminIds as $adminId) {

            Notification::create([
                'user_id' =>
                    $adminId,

                'type' =>
                    'commande',

                'titre' =>
                    'Commande annulée',

                'contenu' =>
                    'La commande ' .
                    $order->numero .
                    ' a été annulée par le client.',

                'lu' =>
                    false,
            ]);
        }

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

    public function sellerOrders(
        Request $request
    ) {
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

        $isSellerOrder =
            $order
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

        $order->update([
            'statut' =>
                $request->statut,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Notification du client
        |--------------------------------------------------------------------------
        */

        Notification::create([
            'user_id' =>
                $order->client->id,

            'type' =>
                'commande',

            'titre' =>
                'Mise à jour de votre commande',

            'contenu' =>
                'Le statut de votre commande est maintenant : ' .
                $request->statut,

            'lu' =>
                false,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Notification des administrateurs
        |--------------------------------------------------------------------------
        */

        $adminIds = User::whereHas('role', function ($query) {
            $query->where('nom', 'Administrateur');
        })
            ->pluck('id');

        foreach ($adminIds as $adminId) {

            Notification::create([
                'user_id' =>
                    $adminId,

                'type' =>
                    'commande',

                'titre' =>
                    'Commande mise à jour',

                'contenu' =>
                    'Le vendeur a modifié le statut de la commande ' .
                    $order->numero .
                    ' : ' .
                    $request->statut,

                'lu' =>
                    false,
            ]);
        }

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