<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
class PayPalService
{
    private string $baseUrl = 'https://api-m.sandbox.paypal.com';

    /**
     * Get PayPal access token.
     */
    public function getAccessToken(): string
    {
        $response = Http::asForm()
            ->withBasicAuth(
                config('services.paypal.client_id'),
                config('services.paypal.client_secret')
            )
            ->post(
                $this->baseUrl . '/v1/oauth2/token',
                [
                    'grant_type' => 'client_credentials',
                ]
            );

        $response->throw();

        return $response->json('access_token');
    }

    /**
     * Create a PayPal order.
     */
    public function createOrder(float $amount, string $customId): array
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->withHeaders([
                'Content-Type' => 'application/json',
            ])
            ->post(
                $this->baseUrl . '/v2/checkout/orders',
                [
                    'intent' => 'CAPTURE',

                    'purchase_units' => [
                        [
                            'custom_id' => $customId,

                            'amount' => [
                                'currency_code' => 'USD',
                                'value' => number_format(
                                    $amount,
                                    2,
                                    '.',
                                    ''
                                ),
                            ],
                        ],
                    ],

                    'application_context' => [
                        'user_action' => 'PAY_NOW',

                        'return_url' =>
                            'http://127.0.0.1:8000/api/paypal/callback',

                        'cancel_url' =>
                            'http://localhost:5173/client/checkout',
                    ],
                ]
            );

        $response->throw();

        $paypalOrder = $response->json();

        $approvalLink = collect(
            $paypalOrder['links'] ?? []
        )->firstWhere('rel', 'approve');

        return [
            'id' => $paypalOrder['id'] ?? null,
            'approval_url' => $approvalLink['href'] ?? null,
        ];
    }

    /**
     * Get a PayPal order.
     */
    public function getOrder(string $paypalOrderId): array
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->get(
                $this->baseUrl .
                '/v2/checkout/orders/' .
                $paypalOrderId
            );

        $response->throw();

        return $response->json();
    }

    /**
     * Capture an approved PayPal order.
     */
    public function captureOrder(string $paypalOrderId): array
    {
        $accessToken = $this->getAccessToken();

        /*
         * PayPal expects an empty JSON OBJECT {} here.
         * Do not send [] because that is a JSON ARRAY.
         */
        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->withBody('{}', 'application/json')
            ->post(
                $this->baseUrl .
                '/v2/checkout/orders/' .
                $paypalOrderId .
                '/capture'
            );

        if ($response->failed()) {
            Log::error('PayPal Capture Error', [
                'order_id' => $paypalOrderId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            $response->throw();
        }

        return $response->json();
    }
}