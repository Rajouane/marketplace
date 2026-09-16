<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Liste des coupons actifs
     */
    public function index()
    {
        return response()->json(
            Coupon::where('actif', true)
                ->latest()
                ->get()
        );
    }

    /**
     * Créer un coupon
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:100|unique:coupons,code',
            'type' => 'required|in:montant,pourcentage',
            'valeur' => 'required|numeric|min:0',
            'montant_minimum' => 'nullable|numeric|min:0',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'nombre_max_utilisations' => 'nullable|integer|min:1',
            'actif' => 'boolean',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'valeur' => $request->valeur,
            'montant_minimum' => $request->montant_minimum ?? 0,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'nombre_max_utilisations' =>
                $request->nombre_max_utilisations,
            'nombre_utilisations' => 0,
            'actif' => $request->actif ?? true,
        ]);

        return response()->json([
            'message' => 'Coupon créé avec succès',
            'coupon' => $coupon,
        ], 201);
    }

    /**
     * Vérifier un coupon
     */
    public function show(string $code)
    {
        $coupon = Coupon::where('code', strtoupper($code))
            ->where('actif', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'message' => 'Coupon invalide',
            ], 404);
        }

        if (
            $coupon->date_debut &&
            now()->lt($coupon->date_debut)
        ) {
            return response()->json([
                'message' => 'Coupon pas encore disponible',
            ], 422);
        }

        if (
            $coupon->date_fin &&
            now()->gt($coupon->date_fin)
        ) {
            return response()->json([
                'message' => 'Coupon expiré',
            ], 422);
        }

        if (
            $coupon->nombre_max_utilisations !== null &&
            $coupon->nombre_utilisations >=
            $coupon->nombre_max_utilisations
        ) {
            return response()->json([
                'message' => 'Coupon épuisé',
            ], 422);
        }

        return response()->json([
            'message' => 'Coupon valide',
            'coupon' => $coupon,
        ]);
    }

    /**
     * Modifier un coupon
     */
    public function update(
        Request $request,
        Coupon $coupon
    ) {
        $request->validate([
            'code' => 'sometimes|string|max:100',
            'type' => 'sometimes|in:montant,pourcentage',
            'valeur' => 'sometimes|numeric|min:0',
            'montant_minimum' => 'nullable|numeric|min:0',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'nombre_max_utilisations' => 'nullable|integer|min:1',
            'actif' => 'boolean',
        ]);

        $data = $request->only([
            'code',
            'type',
            'valeur',
            'montant_minimum',
            'date_debut',
            'date_fin',
            'nombre_max_utilisations',
            'actif',
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return response()->json([
            'message' => 'Coupon modifié avec succès',
            'coupon' => $coupon,
        ]);
    }

    /**
     * Supprimer un coupon
     */
    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return response()->json([
            'message' => 'Coupon supprimé avec succès',
        ]);
    }
}