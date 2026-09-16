<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::with('role')
                ->latest()
                ->get()
        );
    }

    public function show(User $user)
    {
        return response()->json(
            $user->load('role')
        );
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'telephone' => 'nullable|string|max:30',
            'role_id' => 'sometimes|required|exists:roles,id',
            'statut' => 'sometimes|in:actif,suspendu',
        ]);

        $user->update(
            $request->only([
                'nom',
                'email',
                'telephone',
                'role_id',
                'statut',
            ])
        );

        return response()->json([
            'message' => 'Utilisateur modifié avec succès',
            'user' => $user->load('role'),
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès',
        ]);
    }
}