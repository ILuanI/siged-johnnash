<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * @param  array<string, mixed>|null  $data
     */
    public static function success(
        mixed $data = null,
        string $message = 'Operación exitosa.',
        int $status = 200,
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * @param  array<string, mixed>|array<int, string>|null  $errors
     */
    public static function error(
        string $message,
        int $status = 400,
        ?array $errors = null,
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
