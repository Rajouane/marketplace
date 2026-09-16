<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Afficher le paiement d'une commande
     */
    public function show(Request $request, Order $order)
    {
        if ($order->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        return response()->json(
            $order->payment
        );
    }

    /**
     * Créer un paiement
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

        $payment = Payment::updateOrCreate(
            [
                'order_id' => $order->id,
            ],
            [
                'mode' => $request->mode,
                'statut' => 'en_attente',
            ]
        );

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'payment' => $payment,
        ], 201);
    }
}