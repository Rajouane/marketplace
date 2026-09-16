<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * Afficher les images d'un produit
     */
    public function index(Product $product)
    {
        return response()->json(
            $product->images()->latest()->get()
        );
    }

    /**
     * Ajouter une image
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $path = $request->file('image')->store(
            'products',
            'public'
        );

        $image = ProductImage::create([
            'product_id' => $product->id,
            'chemin' => $path,
        ]);

        return response()->json([
            'message' => 'Image ajoutée avec succès',
            'image' => $image,
        ], 201);
    }

    /**
     * Supprimer une image
     */
    public function destroy(ProductImage $productImage)
    {
        if (Storage::disk('public')->exists($productImage->chemin)) {
            Storage::disk('public')->delete(
                $productImage->chemin
            );
        }

        $productImage->delete();

        return response()->json([
            'message' => 'Image supprimée avec succès',
        ]);
    }
}