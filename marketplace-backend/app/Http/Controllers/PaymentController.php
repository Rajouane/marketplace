<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Services\PayPalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PaymentController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Afficher le paiement d'une commande
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, Order $order)
    {
        if ($order->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        return response()->json($order->payment);
    }

    /*
    |--------------------------------------------------------------------------
    | Paiement normal d'une commande existante
    |--------------------------------------------------------------------------
    */

    public function store(Request $request, Order $order)
    {
        if ($order->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $request->validate([
            'mode' => 'required|string|max:100',
        ]);

        if ($request->mode !== 'paypal') {
            $payment = Payment::updateOrCreate(
                [
                    'order_id' => $order->id,
                ],
                [
                    'mode' => $request->mode,
                    'statut' => 'en_attente',
                    'reference' => null,
                ]
            );

            return response()->json([
                'message' => 'Paiement enregistré avec succès',
                'payment' => $payment,
            ], 201);
        }

        return response()->json([
            'message' => 'Pour PayPal, utilisez le paiement depuis le checkout.',
        ], 422);
    }

    /*
    |--------------------------------------------------------------------------
    | Créer une commande PayPal
    |--------------------------------------------------------------------------
    |
    | Cette méthode crée uniquement la commande PayPal.
    | La commande Marketplace sera créée après le paiement.
    |
    */

    public function createPayPalPayment(Request $request)
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
        | Calcul du total
        |--------------------------------------------------------------------------
        */

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

        $total = $sousTotal + $fraisLivraison - $reduction;

        /*
        |--------------------------------------------------------------------------
        | Informations sécurisées pour le callback
        |--------------------------------------------------------------------------
        */

        $state = Crypt::encryptString(
            json_encode([
                'user_id' => $user->id,
                'address_id' => $address->id,
            ])
        );

        /*
        |--------------------------------------------------------------------------
        | Création de la transaction PayPal
        |--------------------------------------------------------------------------
        */

        $paypal = app(PayPalService::class);

        $paypalOrder = $paypal->createOrder(
            (float) $total,
            $state
        );

        return response()->json([
            'message' => 'Redirection vers PayPal',
            'paypal' => $paypalOrder,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Retour PayPal après confirmation
    |--------------------------------------------------------------------------
    */

    public function paypalCallback(Request $request)
    {
        $paypalOrderId = $request->query('token');

        if (!$paypalOrderId) {
            return redirect(
                'http://localhost:5173/client/checkout?payment=cancelled'
            );
        }

        try {
            $paypal = app(PayPalService::class);

            /*
            |--------------------------------------------------------------------------
            | Récupérer la commande PayPal
            |--------------------------------------------------------------------------
            */

            $paypalOrder = $paypal->getOrder(
                $paypalOrderId
            );

            /*
            |--------------------------------------------------------------------------
            | Si déjà complétée
            |--------------------------------------------------------------------------
            */

            if (($paypalOrder['status'] ?? '') === 'COMPLETED') {
                return $this->finishPayPalOrder(
                    $paypalOrder,
                    $paypalOrderId
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Vérifier que la commande est approuvée
            |--------------------------------------------------------------------------
            */

            if (($paypalOrder['status'] ?? '') !== 'APPROVED') {
                report(new \Exception(
                    'PayPal order status inattendu : ' .
                    ($paypalOrder['status'] ?? 'UNKNOWN')
                ));

                return redirect(
                    'http://localhost:5173/client/checkout?payment=failed'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Capturer le paiement
            |--------------------------------------------------------------------------
            */

            $capture = $paypal->captureOrder(
                $paypalOrderId
            );

            /*
            |--------------------------------------------------------------------------
            | Vérifier le résultat de la capture
            |--------------------------------------------------------------------------
            */

            if (($capture['status'] ?? '') !== 'COMPLETED') {
                report(new \Exception(
                    'PayPal capture non complétée pour : ' .
                    $paypalOrderId
                ));

                return redirect(
                    'http://localhost:5173/client/checkout?payment=failed'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Finaliser réellement la commande Marketplace
            |--------------------------------------------------------------------------
            */

            return $this->finishPayPalOrder(
                $capture,
                $paypalOrderId
            );

        } catch (\Throwable $e) {
            report($e);

            return redirect(
                'http://localhost:5173/client/checkout?payment=failed'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Finaliser la commande après paiement PayPal
    |--------------------------------------------------------------------------
    */

    private function finishPayPalOrder(
        array $paypalResponse,
        string $paypalOrderId
    ) {
        /*
        |--------------------------------------------------------------------------
        | Récupérer custom_id
        |--------------------------------------------------------------------------
        |
        | Après capture, custom_id peut se trouver dans :
        |
        | purchase_units[0].payments.captures[0].custom_id
        |
        | ou directement dans :
        |
        | purchase_units[0].custom_id
        |
        */

        $customId =
            $paypalResponse['purchase_units'][0]['payments']['captures'][0]['custom_id']
            ?? $paypalResponse['purchase_units'][0]['custom_id']
            ?? null;

        /*
        |--------------------------------------------------------------------------
        | Si custom_id absent, récupérer la commande PayPal
        |--------------------------------------------------------------------------
        */

        if (!$customId) {
            $paypal = app(PayPalService::class);

            $paypalOrder = $paypal->getOrder(
                $paypalOrderId
            );

            $customId =
                $paypalOrder['purchase_units'][0]['custom_id']
                ?? null;
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier custom_id
        |--------------------------------------------------------------------------
        */

        if (!$customId) {
            report(new \Exception(
                'PayPal custom_id introuvable pour la commande : ' .
                $paypalOrderId
            ));

            return redirect(
                'http://localhost:5173/client/checkout?payment=error'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Déchiffrer les informations
        |--------------------------------------------------------------------------
        */

        try {
            $data = json_decode(
                Crypt::decryptString($customId),
                true
            );
        } catch (\Throwable $e) {
            report($e);

            return redirect(
                'http://localhost:5173/client/checkout?payment=error'
            );
        }

        $userId = $data['user_id'] ?? null;
        $addressId = $data['address_id'] ?? null;

        if (!$userId || !$addressId) {
            return redirect(
                'http://localhost:5173/client/checkout?payment=error'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Récupérer utilisateur
        |--------------------------------------------------------------------------
        */

        $user = User::find($userId);

        if (!$user) {
            return redirect(
                'http://localhost:5173/client/checkout?payment=error'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier l'adresse
        |--------------------------------------------------------------------------
        */

        $address = Address::where('id', $addressId)
            ->where('client_id', $user->id)
            ->first();

        if (!$address) {
            return redirect(
                'http://localhost:5173/client/checkout?payment=error'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier si le paiement existe déjà
        |--------------------------------------------------------------------------
        */

        $existingPayment = Payment::where(
            'reference',
            $paypalOrderId
        )->first();

        if ($existingPayment) {
            return redirect(
                'http://localhost:5173/client/orders?payment=success'
            );
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

        /*
        |--------------------------------------------------------------------------
        | Panier vide
        |--------------------------------------------------------------------------
        |
        | Cela peut arriver si la commande a déjà été créée.
        |
        */

        if (!$cart || $cart->items->isEmpty()) {
            return redirect(
                'http://localhost:5173/client/orders?payment=success'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Vérifier encore le stock
        |--------------------------------------------------------------------------
        */

        foreach ($cart->items as $item) {
            if (!$item->product) {
                return redirect(
                    'http://localhost:5173/client/checkout?payment=failed'
                );
            }

            if ($item->product->stock < $item->quantite) {
                return redirect(
                    'http://localhost:5173/client/checkout?payment=failed'
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Créer réellement la commande Marketplace
        |--------------------------------------------------------------------------
        */

        try {
            $orderController = app(OrderController::class);

            $order = $orderController->createOrderFromCart(
                $user,
                $address,
                $cart,
                'paypal',
                'paye',
                $paypalOrderId
            );

            /*
            |--------------------------------------------------------------------------
            | Confirmer la commande
            |--------------------------------------------------------------------------
            */

            $order->update([
                'statut' => 'confirmee',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Redirection vers les commandes
            |--------------------------------------------------------------------------
            */

            return redirect(
                'http://localhost:5173/client/orders?payment=success'
            );

        } catch (\Throwable $e) {
            report($e);

            return redirect(
                'http://localhost:5173/client/checkout?payment=error'
            );
        }
    }
}