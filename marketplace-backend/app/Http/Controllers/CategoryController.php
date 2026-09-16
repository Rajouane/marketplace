<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::with('parent')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'statut' => 'boolean',
        ]);

        $category = Category::create([
            'nom' => $request->nom,
            'parent_id' => $request->parent_id,
            'statut' => $request->statut ?? true,
        ]);

        return response()->json([
            'message' => 'Catégorie créée avec succès',
            'category' => $category,
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json(
            $category->load('parent', 'children', 'products')
        );
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'statut' => 'boolean',
        ]);

        $category->update($request->only([
            'nom',
            'parent_id',
            'statut',
        ]));

        return response()->json([
            'message' => 'Catégorie modifiée avec succès',
            'category' => $category,
        ]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Catégorie supprimée avec succès',
        ]);
    }
}