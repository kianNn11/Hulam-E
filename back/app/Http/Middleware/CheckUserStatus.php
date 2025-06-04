<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Log middleware activity
        Log::info('CheckUserStatus middleware triggered', [
            'path' => $request->path(),
            'method' => $request->method(),
            'user_id' => $user ? $user->id : null,
            'user_status' => $user ? $user->verification_status : null
        ]);
        
        if (!$user) {
            Log::info('CheckUserStatus: No authenticated user, allowing request');
            return $next($request);
        }

        // Check if user is suspended - restrict posting, renting, transactions
        if ($user->verification_status === 'suspended') {
            $restrictedOperations = [
                // Rental posting and management
                ['methods' => ['POST'], 'paths' => ['api/rentals'], 'action' => 'posting items'],
                ['methods' => ['PUT', 'PATCH'], 'paths' => ['api/rentals/*'], 'action' => 'editing your items'],
                
                // Rental requests and transactions
                ['methods' => ['POST'], 'paths' => ['api/contact-rental'], 'action' => 'requesting items to rent'],
                ['methods' => ['POST'], 'paths' => ['api/checkout'], 'action' => 'checking out items'],
                ['methods' => ['POST'], 'paths' => ['api/transactions/*/approve'], 'action' => 'approving rental requests'],
                ['methods' => ['POST'], 'paths' => ['api/transactions/*/reject'], 'action' => 'rejecting rental requests'],
                ['methods' => ['POST'], 'paths' => ['api/transactions/*/complete'], 'action' => 'completing transactions'],
                
                // Student verification
                ['methods' => ['POST'], 'paths' => ['api/users/verify-student'], 'action' => 'submitting verification documents'],
                
                // Profile updates that could affect business operations
                ['methods' => ['PUT', 'PATCH'], 'paths' => ['api/users/profile'], 'action' => 'updating your profile']
            ];
            
            foreach ($restrictedOperations as $operation) {
                if (in_array($request->method(), $operation['methods'])) {
                    foreach ($operation['paths'] as $pathPattern) {
                        // Convert wildcard pattern to regex
                        $pattern = str_replace('*', '[^/]+', $pathPattern);
                        $pattern = '/^' . str_replace('/', '\/', $pattern) . '$/';
                        
                        if (preg_match($pattern, $request->path())) {
                            Log::warning('CheckUserStatus: Blocking suspended user from restricted operation', [
                                'user_id' => $user->id,
                                'path' => $request->path(),
                                'action' => $operation['action']
                            ]);
                            
                            return response()->json([
                                'error' => 'Account suspended',
                                'message' => 'Your account has been suspended. You cannot perform this action while suspended.',
                                'restriction_type' => 'suspended',
                                'restriction_details' => [
                                    'blocked_action' => $operation['action'],
                                    'contact_info' => 'Please contact support for assistance: support@hulame.com',
                                    'user_status' => 'suspended'
                                ]
                            ], 403);
                        }
                    }
                }
            }
        }

        // Check if user is deactivated - force logout for ANY request
        if ($user->verification_status === 'inactive') {
            Log::warning('CheckUserStatus: Blocking deactivated user from all operations', [
                'user_id' => $user->id,
                'path' => $request->path()
            ]);
            
            return response()->json([
                'error' => 'Account deactivated',
                'message' => 'Your account has been deactivated. Please contact support to reactivate your account.',
                'restriction_type' => 'deactivated',
                'restriction_details' => [
                    'contact_info' => 'Please contact support to reactivate your account: support@hulame.com',
                    'user_status' => 'inactive'
                ]
            ], 403);
        }

        Log::info('CheckUserStatus: User status acceptable, allowing request', [
            'user_id' => $user->id,
            'status' => $user->verification_status
        ]);

        return $next($request);
    }
} 