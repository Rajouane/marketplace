<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Liste des notifications
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $notifications = Notification::where(
            'user_id',
            $request->user()->id
        )
            ->latest()
            ->get();

        return response()->json($notifications);
    }


    /*
    |--------------------------------------------------------------------------
    | Afficher une notification
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        Notification $notification
    ) {
        if (
            $notification->user_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'Accès non autorisé.',
            ], 403);
        }

        return response()->json($notification);
    }


    /*
    |--------------------------------------------------------------------------
    | Marquer une notification comme lue
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Notification $notification
    ) {
        if (
            $notification->user_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'Accès non autorisé.',
            ], 403);
        }

        $notification->update([
            'lu' => true,
        ]);

        return response()->json([
            'message' =>
                'Notification marquée comme lue',

            'notification' =>
                $notification,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Supprimer une notification
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Notification $notification
    ) {
        if (
            $notification->user_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' =>
                    'Accès non autorisé.',
            ], 403);
        }

        $notification->delete();

        return response()->json([
            'message' =>
                'Notification supprimée',
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Marquer toutes les notifications comme lues
    |--------------------------------------------------------------------------
    */

    public function markAllAsRead(
        Request $request
    ) {
        Notification::where(
            'user_id',
            $request->user()->id
        )
            ->where(
                'lu',
                false
            )
            ->update([
                'lu' => true,
            ]);

        return response()->json([
            'message' =>
                'Toutes les notifications sont lues',
        ]);
    }
}