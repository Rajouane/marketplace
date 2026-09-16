<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    /**
     * Liste des adresses du client
     */
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->addresses()->latest()->get()
        );
    }

    /**
     * Ajouter une adresse
     */
    public function store(Request $request)
    {
        $request->validate([
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'code_postal' => 'nullable|string|max:20',
            'pays' => 'nullable|string|max:100',
        ]);

        $address = $request->user()->addresses()->create([
            'adresse' => $request->adresse,
            'ville' => $request->ville,
            'code_postal' => $request->code_postal,
            'pays' => $request->pays ?? 'Maroc',
        ]);

        return response()->json([
            'message' => 'Adresse créée avec succès',
            'address' => $address,
        ], 201);
    }

    /**
     * Afficher une adresse
     */
    public function show(Request $request, Address $address)
    {
        if ($address->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        return response()->json($address);
    }

    /**
     * Modifier une adresse
     */
    public function update(Request $request, Address $address)
    {
        if ($address->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $request->validate([
            'adresse' => 'sometimes|required|string|max:255',
            'ville' => 'sometimes|required|string|max:100',
            'code_postal' => 'nullable|string|max:20',
            'pays' => 'nullable|string|max:100',
        ]);

        $address->update($request->only([
            'adresse',
            'ville',
            'code_postal',
            'pays',
        ]));

        return response()->json([
            'message' => 'Adresse modifiée avec succès',
            'address' => $address,
        ]);
    }

    /**
     * Supprimer une adresse
     */
    public function destroy(Request $request, Address $address)
    {
        if ($address->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Accès non autorisé',
            ], 403);
        }

        $address->delete();

        return response()->json([
            'message' => 'Adresse supprimée avec succès',
        ]);
    }
}