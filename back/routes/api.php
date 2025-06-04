<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\RentalController;
use App\Http\Controllers\API\AdminController;
use App\Models\Transaction;
use App\Models\Notification;
use App\Models\User;
use App\Models\Rental;

// Simple test route
Route::get('/test-simple', function() {
    return response()->json(['message' => 'Simple test route working!']);
});

// Direct admin test route
Route::get('/admin/direct-test', function() {
    return response()->json(['message' => 'Direct admin route working!']);
});

// Public routes - explicitly define with leading slashes to match frontend
Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Test route to verify API is working
Route::get('/test', function() {
    return response()->json(['message' => 'API is working!']);
});

// Simple test for rentals
Route::get('/test-rentals', function() {
    return response()->json(['message' => 'Rentals endpoint test!']);
});

// Public rental routes (viewing only)
Route::get('/rentals', [RentalController::class, 'index']);
Route::get('/rentals/{rental}', [RentalController::class, 'show']);

// Contact rental endpoint - now creates transaction and notifications
Route::post('/contact-rental', function(Request $request) {
    try {
        $validated = $request->validate([
            'rental_id' => 'required|exists:rentals,id',
            'sender_name' => 'required|string|max:255',
            'sender_email' => 'required|email',
            'message' => 'required|string|max:1000',
            'rental_title' => 'required|string',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'renter_id' => 'required|exists:users,id'
        ]);

        // Get rental and user details
        $rental = \Illuminate\Support\Facades\DB::table('rentals')
            ->join('users', 'rentals.user_id', '=', 'users.id')
            ->select('rentals.*', 'users.email as owner_email', 'users.name as owner_name')
            ->where('rentals.id', $validated['rental_id'])
            ->first();

        if (!$rental) {
            return response()->json([
                'success' => false,
                'message' => 'Rental not found'
            ], 404);
        }

        // Check if user is trying to rent their own item
        if ($rental->user_id == $validated['renter_id']) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot rent your own item'
            ], 400);
        }

        // Calculate total amount (price per day * number of days)
        $startDate = \Carbon\Carbon::parse($validated['start_date']);
        $endDate = \Carbon\Carbon::parse($validated['end_date']);
        $totalDays = $startDate->diffInDays($endDate) + 1;
        $totalAmount = $rental->price * $totalDays;

        // Create transaction
        $transaction = Transaction::create([
            'rental_id' => $rental->id,
            'renter_id' => $validated['renter_id'],
            'owner_id' => $rental->user_id,
            'status' => 'pending',
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'total_amount' => $totalAmount,
            'renter_message' => $validated['message']
        ]);

        // Create notification for owner
        Notification::createForUser(
            $rental->user_id,
            'rental_request',
            'New Rental Request',
            "{$validated['sender_name']} wants to rent your '{$rental->title}' from {$startDate->format('M d')} to {$endDate->format('M d, Y')}",
            [
                'transaction_id' => $transaction->id,
                'rental_id' => $rental->id,
                'renter_id' => $validated['renter_id'],
                'total_amount' => $totalAmount,
                'total_days' => $totalDays
            ]
        );

        // Create notification for renter
        Notification::createForUser(
            $validated['renter_id'],
            'rental_request',
            'Rental Request Sent',
            "Your rental request for '{$rental->title}' has been sent to {$rental->owner_name}. You'll be notified when they respond.",
            [
                'transaction_id' => $transaction->id,
                'rental_id' => $rental->id,
                'owner_id' => $rental->user_id
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Rental request sent successfully',
            'data' => [
                'transaction_id' => $transaction->id,
                'total_amount' => $totalAmount,
                'total_days' => $totalDays
            ]
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Contact rental error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to send rental request. Please try again.'
        ], 500);
    }
});

// Checkout endpoint for multiple rental items
Route::post('/checkout', function(Request $request) {
    try {
        \Illuminate\Support\Facades\Log::info('Checkout request received', $request->all());
        
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|integer',
            'items.*.name' => 'required|string',
            'items.*.price' => 'required|numeric|min:0',
            'renter_name' => 'required|string|max:255',
            'renter_email' => 'required|email',
            'contact_number' => 'required|string|max:20',
            'rent_duration' => 'required|string|max:100',
            'message' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:cash_on_delivery,gcash',
            'renter_id' => 'nullable|exists:users,id'
        ]);

        $totalAmount = 0;
        $transactions = [];
        $platform_fee = 10.00;

        // Calculate subtotal
        foreach ($validated['items'] as $item) {
            $totalAmount += $item['price'];
        }

        // Add platform fee
        $finalTotal = $totalAmount + $platform_fee;

        \Illuminate\Support\Facades\Log::info('Checkout validation passed', [
            'items_count' => count($validated['items']),
            'total_amount' => $finalTotal,
            'renter_id' => $validated['renter_id']
        ]);

        // Create transactions for each item
        foreach ($validated['items'] as $item) {
            $rental = Rental::find($item['id']);
            
            if (!$rental) {
                \Illuminate\Support\Facades\Log::warning('Rental not found', ['rental_id' => $item['id']]);
                continue; // Skip if rental not found
            }

            \Illuminate\Support\Facades\Log::info('Creating transaction', [
                'rental_id' => $rental->id,
                'owner_id' => $rental->user_id,
                'renter_id' => $validated['renter_id'],
                'amount' => $item['price']
            ]);

            $transaction = Transaction::create([
                'rental_id' => $rental->id,
                'renter_id' => $validated['renter_id'],
                'owner_id' => $rental->user_id,
                'status' => 'pending',
                'start_date' => now()->addDay(), // Default to tomorrow
                'end_date' => now()->addDays(7), // Default 7 days
                'total_amount' => $item['price'],
                'renter_message' => $validated['message'] ?? "Rental request via checkout for {$validated['rent_duration']}"
            ]);

            $transactions[] = $transaction;

            \Illuminate\Support\Facades\Log::info('Transaction created', [
                'transaction_id' => $transaction->id,
                'rental_id' => $rental->id,
                'owner_id' => $rental->user_id
            ]);

            // Update rental status to 'rented' after successful checkout
            $rental->update(['status' => 'rented']);

            // Create notification for owner
            Notification::createForUser(
                $rental->user_id,
                'rental_request',
                'New Rental Request',
                "{$validated['renter_name']} wants to rent your '{$rental->title}' via checkout",
                [
                    'transaction_id' => $transaction->id,
                    'rental_id' => $rental->id,
                    'renter_id' => $validated['renter_id'],
                    'total_amount' => $item['price'],
                    'contact_number' => $validated['contact_number'],
                    'rent_duration' => $validated['rent_duration'],
                    'payment_method' => $validated['payment_method']
                ]
            );
        }

        // Create notification for renter if authenticated
        if ($validated['renter_id']) {
            Notification::createForUser(
                $validated['renter_id'],
                'checkout_complete',
                'Checkout Complete',
                "Your rental request for " . count($validated['items']) . " item(s) has been submitted. Total: ₱" . number_format($finalTotal, 2),
                [
                    'total_amount' => $finalTotal,
                    'platform_fee' => $platform_fee,
                    'subtotal' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'item_count' => count($validated['items'])
                ]
            );
        }

        \Illuminate\Support\Facades\Log::info('Checkout completed successfully', [
            'transaction_count' => count($transactions),
            'transaction_ids' => array_map(fn($t) => $t->id, $transactions)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Checkout completed successfully',
            'data' => [
                'transaction_ids' => array_map(fn($t) => $t->id, $transactions),
                'subtotal' => $totalAmount,
                'platform_fee' => $platform_fee,
                'total_amount' => $finalTotal,
                'items_count' => count($validated['items']),
                'payment_method' => $validated['payment_method']
            ]
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Illuminate\Support\Facades\Log::error('Checkout validation failed', $e->errors());
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Checkout error:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Checkout failed. Please try again.'
        ], 500);
    }
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'getCurrentUser']);
    
    // User profile - specific route must come before parameterized route
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    
    // User rentals route
    Route::get('/users/{userId}/rentals', [UserController::class, 'getUserRentals']);
    Route::get('/user/rentals', [UserController::class, 'getUserRentals']);
    
    // Student Verification Endpoint
    Route::post('/users/verify-student', function(Request $request) {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }
            
            $validated = $request->validate([
                'userId' => 'required|integer',
                'verificationData' => 'required|string', // JSON string when sent via FormData
                'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
                'documentBase64' => 'nullable|string'
            ]);
            
            // Parse the JSON verification data
            $verificationData = json_decode($validated['verificationData'], true);
            if (!$verificationData) {
                return response()->json(['error' => 'Invalid verification data format'], 422);
            }
            
            // Verify the user ID matches the authenticated user
            if ($validated['userId'] != $user->id) {
                return response()->json(['error' => 'Unauthorized access'], 403);
            }
            
            // Handle file upload if provided
            $documentData = null;
            if ($request->hasFile('document')) {
                $file = $request->file('document');
                $fileName = time() . '_' . $file->getClientOriginalName();
                
                // Ensure the storage/verification_documents directory exists
                $storagePath = storage_path('app/public/verification_documents');
                if (!file_exists($storagePath)) {
                    mkdir($storagePath, 0755, true);
                }
                
                $filePath = $file->storeAs('verification_documents', $fileName, 'public');
                $documentData = asset('storage/' . $filePath);
            } elseif ($request->has('documentBase64')) {
                // Handle base64 data if provided
                $documentData = $request->input('documentBase64');
            } else {
                return response()->json(['error' => 'No document provided'], 422);
            }
            
            // Update user verification fields
            $user->update([
                'verification_document' => $documentData,
                'verification_document_type' => $verificationData['fileName'] ?? 'Certificate of Registration',
                'verification_submitted_at' => now(),
                'verification_status' => 'pending'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Verification document submitted successfully. Your request is now pending admin review.',
                'status' => 'pending'
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Student verification error:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user() ? $request->user()->id : 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to submit verification request. Please try again.',
                'message' => $e->getMessage()
            ], 500);
        }
    });
    
    // Rentals - protected operations
    Route::post('/rentals', [RentalController::class, 'store']);
    Route::put('/rentals/{rental}', [RentalController::class, 'update']);
    Route::delete('/rentals/{rental}', [RentalController::class, 'destroy']);

    // Transaction Management APIs
    // Get user transactions (as renter or owner)
    Route::get('/transactions', function(Request $request) {
        try {
            $user = $request->user();
            $query = Transaction::with(['rental', 'renter:id,name,email', 'owner:id,name,email']);
            
            // Filter by role
            if ($request->has('role')) {
                if ($request->role === 'renter') {
                    $query->where('renter_id', $user->id);
                } elseif ($request->role === 'owner') {
                    $query->where('owner_id', $user->id);
                }
            } else {
                $query->forUser($user->id);
            }
            
            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }
            
            $transactions = $query->orderBy('created_at', 'desc')->paginate(10);
            
            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch transactions: ' . $e->getMessage()], 500);
        }
    });

    // Get single transaction
    Route::get('/transactions/{transaction}', function(\App\Models\Transaction $transaction, Request $request) {
        $user = $request->user();
        
        // Check if user is involved in this transaction
        if ($transaction->renter_id !== $user->id && $transaction->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $transaction->load(['rental', 'renter:id,name,email', 'owner:id,name,email']);
        return response()->json(['data' => $transaction]);
    });

    // Approve transaction (owner only)
    Route::post('/transactions/{transaction}/approve', function(\App\Models\Transaction $transaction, Request $request) {
        $user = $request->user();
        
        // Check if user is the owner
        if ($transaction->owner_id !== $user->id) {
            return response()->json(['error' => 'Only the owner can approve transactions'], 403);
        }
        
        if ($transaction->status !== 'pending') {
            return response()->json(['error' => 'Transaction is not pending'], 400);
        }
        
        $validated = $request->validate([
            'response' => 'nullable|string|max:500'
        ]);
        
        $transaction->update([
            'status' => 'approved',
            'approved_at' => now(),
            'owner_response' => $validated['response'] ?? null
        ]);
        
        // Create notification for renter
        Notification::createForUser(
            $transaction->renter_id,
            'rental_approved',
            'Rental Request Approved!',
            "Your rental request for '{$transaction->rental->title}' has been approved by {$user->name}",
            [
                'transaction_id' => $transaction->id,
                'rental_id' => $transaction->rental_id
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction approved successfully',
            'data' => $transaction->fresh(['rental', 'renter:id,name,email'])
        ]);
    });

    // Reject transaction (owner only)
    Route::post('/transactions/{transaction}/reject', function(\App\Models\Transaction $transaction, Request $request) {
        $user = $request->user();
        
        // Check if user is the owner
        if ($transaction->owner_id !== $user->id) {
            return response()->json(['error' => 'Only the owner can reject transactions'], 403);
        }
        
        if ($transaction->status !== 'pending') {
            return response()->json(['error' => 'Transaction is not pending'], 400);
        }
        
        $validated = $request->validate([
            'response' => 'required|string|max:500'
        ]);
        
        $transaction->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'owner_response' => $validated['response']
        ]);
        
        // Ensure rental remains available when transaction is rejected
        $rental = $transaction->rental;
        if ($rental && $rental->status !== 'available') {
            $rental->update(['status' => 'available']);
        }
        
        // Create notification for renter
        Notification::createForUser(
            $transaction->renter_id,
            'rental_rejected',
            'Rental Request Rejected',
            "Your rental request for '{$transaction->rental->title}' has been rejected by {$user->name}",
            [
                'transaction_id' => $transaction->id,
                'rental_id' => $transaction->rental_id,
                'reason' => $validated['response']
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction rejected',
            'data' => $transaction->fresh(['rental', 'renter:id,name,email'])
        ]);
    });

    // Complete transaction (both parties can mark as completed)
    Route::post('/transactions/{transaction}/complete', function(\App\Models\Transaction $transaction, Request $request) {
        $user = $request->user();
        
        // Check if user is involved in this transaction
        if ($transaction->renter_id !== $user->id && $transaction->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        if ($transaction->status !== 'approved') {
            return response()->json(['error' => 'Transaction must be approved first'], 400);
        }
        
        $transaction->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
        
        // Update rental status to 'rented' when transaction is completed
        $rental = $transaction->rental;
        if ($rental) {
            $rental->update(['status' => 'rented']);
        }
        
        // Create notifications for both parties
        $otherUserId = $transaction->renter_id === $user->id ? $transaction->owner_id : $transaction->renter_id;
        
        Notification::createForUser(
            $otherUserId,
            'rental_completed',
            'Rental Completed',
            "The rental for '{$transaction->rental->title}' has been marked as completed",
            [
                'transaction_id' => $transaction->id,
                'rental_id' => $transaction->rental_id
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Transaction marked as completed',
            'data' => $transaction->fresh(['rental', 'renter:id,name,email', 'owner:id,name,email'])
        ]);
    });

    // Get user earnings data
    Route::get('/users/{user}/earnings', function(User $user, Request $request) {
        try {
            $authUser = $request->user();
            
            // Check if user can access this earnings data
            if ($authUser->id !== $user->id && $authUser->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            // Get all transactions where user is the owner (earns money)
            $transactions = Transaction::with(['rental:id,title,price'])
                ->where('owner_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Calculate earnings statistics
            $totalEarnings = $transactions->where('status', 'completed')->sum('total_amount');
            $pendingEarnings = $transactions->whereIn('status', ['pending', 'approved'])->sum('total_amount');
            $availableBalance = $totalEarnings;
            
            // Get rental statistics
            $totalRentals = $user->rentals()->count();
            $activeRentals = $user->rentals()->where('status', 'rented')->count();
            
            // Generate monthly breakdown (last 12 months)
            $monthlyBreakdown = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthName = $date->format('M');
                $monthEarnings = $transactions
                    ->whereIn('status', ['completed', 'approved', 'pending'])
                    ->filter(function($transaction) use ($date) {
                        return $transaction->created_at->isSameMonth($date);
                    })
                    ->sum('total_amount');
                
                $monthlyBreakdown[] = [
                    'month' => $monthName,
                    'amount' => $monthEarnings
                ];
            }
            
            // Format transactions for frontend - include all transactions
            $formattedTransactions = $transactions->map(function($transaction) {
                $statusDescriptions = [
                    'pending' => 'Transaction pending approval',
                    'approved' => 'Transaction approved - awaiting completion',
                    'completed' => 'Rental payment received',
                    'rejected' => 'Transaction rejected',
                    'cancelled' => 'Transaction cancelled'
                ];
                
                return [
                    'id' => $transaction->id,
                    'date' => $transaction->created_at->toISOString(),
                    'amount' => $transaction->total_amount,
                    'type' => $transaction->status === 'completed' ? 'rental_payment' : 
                             ($transaction->status === 'approved' ? 'approved' : $transaction->status),
                    'status' => $transaction->status,
                    'description' => $statusDescriptions[$transaction->status] ?? 'Unknown status',
                    'rentalId' => $transaction->rental_id,
                    'rentalTitle' => $transaction->rental->title ?? 'Unknown'
                ];
            });
            
            return response()->json([
                'totalEarnings' => $totalEarnings,
                'pendingPayouts' => $pendingEarnings,
                'availableBalance' => $availableBalance,
                'transactionCount' => $transactions->count(),
                'totalRentals' => $totalRentals,
                'activeRentals' => $activeRentals,
                'transactions' => $formattedTransactions,
                'monthlyBreakdown' => $monthlyBreakdown
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch earnings data: ' . $e->getMessage()
            ], 500);
        }
    });

    // Get current user's earnings (convenience endpoint)
    Route::get('/user/earnings', function(Request $request) {
        $user = $request->user();
        return app('Illuminate\Routing\Router')->dispatch(
            $request->create("/api/users/{$user->id}/earnings", 'GET')
        );
    });
});

// Notification APIs
Route::middleware('auth:sanctum')->group(function () {
    // Get user notifications
    Route::get('/notifications', function(Request $request) {
        try {
            $user = $request->user();
            $query = Notification::forUser($user->id);
            
            if ($request->has('unread_only') && $request->unread_only) {
                $query->unread();
            }
            
            $notifications = $query->orderBy('created_at', 'desc')->paginate(20);
            
            return response()->json($notifications);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch notifications: ' . $e->getMessage()], 500);
        }
    });

    // Mark notification as read
    Route::post('/notifications/{notification}/read', function(\App\Models\Notification $notification, Request $request) {
        $user = $request->user();
        
        if ($notification->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $notification->markAsRead();
        
        return response()->json(['success' => true, 'message' => 'Notification marked as read']);
    });

    // Mark all notifications as read
    Route::post('/notifications/mark-all-read', function(Request $request) {
        $user = $request->user();
        
        Notification::forUser($user->id)->unread()->update(['is_read' => true]);
        
        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    });

    // Get unread notification count
    Route::get('/notifications/unread-count', function(Request $request) {
        $user = $request->user();
        $count = Notification::forUser($user->id)->unread()->count();
        
        return response()->json(['count' => $count]);
    });
});

// Admin routes - moved outside auth middleware for testing
// Test route
Route::get('/admin/test', function() {
    return response()->json([
        'message' => 'Admin test working!',
        'status' => 'success'
    ]);
});

// Dashboard stats
Route::get('/admin/dashboard/stats', function() {
    try {
        $totalUsers = User::count();
        $totalRentals = Rental::count();
        $activeRentals = Rental::where('status', 'active')->count();
        $totalRevenue = Rental::sum('price') * 0.10;

        // For now, we'll use simplified data. In the future, you can add time-based queries
        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'thisWeek' => 0, // TODO: Add time-based queries
                'thisMonth' => 0,
                'thisYear' => 0
            ],
            'rentals' => [
                'total' => $totalRentals,
                'thisWeek' => 0, // TODO: Add time-based queries
                'thisMonth' => 0,
                'active' => $activeRentals
            ],
            'revenue' => [
                'total' => round($totalRevenue, 2),
                'thisWeek' => 0, // TODO: Add time-based queries
                'thisMonth' => 0,
                'thisYear' => 0
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch stats: ' . $e->getMessage()], 500);
    }
});

// Dashboard transactions
Route::get('/admin/dashboard/transactions', function() {
    try {
        $transactions = Rental::with(['user:id,name,email'])
            ->select('id', 'user_id', 'title', 'price', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'name' => $rental->title,
                    'title' => $rental->title,
                    'user_name' => $rental->user->name ?? 'Unknown User',
                    'email' => $rental->user->email ?? 'N/A',
                    'price' => $rental->price,
                    'commission' => round($rental->price * 0.10, 2),
                    'status' => $rental->status,
                    'date' => $rental->created_at->format('M d, Y'),
                    'time' => $rental->created_at->format('h:i A'),
                    'type' => 'rental',
                    'image_url' => null // Add image support later if needed
                ];
            });

        return response()->json(['transactions' => $transactions]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch transactions: ' . $e->getMessage()], 500);
    }
});

// Dashboard activity
Route::get('/admin/dashboard/activity', function() {
    try {
        $activities = collect();

        $newUsers = User::select('id', 'name', 'email', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'user_name' => $user->name,
                    'action' => 'registered',
                    'message' => 'registered a new account',
                    'item_title' => "Account created",
                    'status' => 'completed',
                    'date' => $user->created_at->format('M d, Y'),
                    'time' => $user->created_at->format('h:i A'),
                    'timestamp' => $user->created_at->format('Y-m-d H:i:s'),
                    'type' => 'user',
                    'profile_image_url' => null
                ];
            });

        $newRentals = Rental::with(['user:id,name'])
            ->select('id', 'user_id', 'title', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($rental) {
                return [
                    'id' => $rental->id,
                    'user_name' => $rental->user->name ?? 'Unknown User',
                    'action' => 'posted rental',
                    'message' => 'posted a new rental item',
                    'item_title' => $rental->title,
                    'status' => $rental->status ?? 'available',
                    'date' => $rental->created_at->format('M d, Y'),
                    'time' => $rental->created_at->format('h:i A'),
                    'timestamp' => $rental->created_at->format('Y-m-d H:i:s'),
                    'type' => 'rental',
                    'profile_image_url' => null
                ];
            });

        $activities = $activities->merge($newUsers)->merge($newRentals);
        $activities = $activities->sortByDesc('timestamp')->take(10)->values();

        return response()->json(['activities' => $activities]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch activity: ' . $e->getMessage()], 500);
    }
});

// User Management
Route::get('/admin/users', function(\Illuminate\Http\Request $request) {
    try {
        $query = User::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('role') && !empty($request->role)) {
            $query->where('role', $request->role);
        }

        if ($request->has('verified') && $request->verified !== '') {
            $query->where('verified', (bool) $request->verified);
        }

        $users = $query->withCount('rentals')
                      ->orderBy('created_at', 'desc')
                      ->get()
                      ->map(function ($user) {
                          // Map verification status for frontend compatibility
                          $status = 'not-verified';
                          if ($user->verified) {
                              $status = 'verified';
                          } elseif ($user->verification_status === 'pending') {
                              $status = 'pending';
                          } elseif ($user->verification_status === 'denied') {
                              $status = 'rejected';
                          }

                          return [
                              'id' => $user->id,
                              'name' => $user->name,
                              'email' => $user->email,
                              'role' => $user->role ?? 'user',
                              'verification_status' => $status,
                              'status' => $status,
                              'verified' => $user->verified,
                              'birthday' => $user->birthday,
                              'gender' => $user->gender,
                              'contact_number' => $user->contact_number,
                              'course_year' => $user->course_year,
                              'social_media_link' => $user->social_link,
                              'profile_picture_url' => $user->profile_picture,
                              'verification_document_url' => $user->verification_document,
                              'bio' => $user->bio,
                              'created_at' => $user->created_at,
                              'rentals_count' => $user->rentals_count ?? 0
                          ];
                      });

        return response()->json(['users' => $users]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch users: ' . $e->getMessage()], 500);
    }
});

Route::get('/admin/users/pending', function() {
    try {
        $pendingUsers = User::where('verified', false)
                          ->withCount('rentals')
                          ->orderBy('created_at', 'desc')
                          ->get();

        return response()->json($pendingUsers);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch pending users: ' . $e->getMessage()], 500);
    }
});

// User status update
Route::put('/admin/users/{user}/status', function(\Illuminate\Http\Request $request, \App\Models\User $user) {
    try {
        $request->validate([
            'verified' => 'sometimes|boolean',
            'role' => 'sometimes|in:user,admin',
            'status' => 'sometimes|in:active,suspended,inactive,verified,pending,rejected'
        ]);

        $updated = [];

        if ($request->has('verified')) {
            $user->verified = $request->verified;
            $updated[] = 'verification status';
        }

        if ($request->has('role')) {
            $user->role = $request->role;
            $updated[] = 'role';
        }

        if ($request->has('status')) {
            $status = $request->status;
            
            // Map frontend status to database fields
            switch ($status) {
                case 'suspended':
                    $user->verification_status = 'suspended';
                    $user->verified = false;
                    break;
                case 'inactive':
                    $user->verification_status = 'inactive';
                    $user->verified = false;
                    break;
                case 'verified':
                case 'active':
                    $user->verification_status = 'approved';
                    $user->verified = true;
                    break;
                case 'pending':
                    $user->verification_status = 'pending';
                    $user->verified = false;
                    break;
                case 'rejected':
                    $user->verification_status = 'denied';
                    $user->verified = false;
                    break;
            }
            
            $updated[] = 'status';
        }

        $user->save();

        // Return mapped status for frontend
        $frontendStatus = 'not-verified';
        if ($user->verified) {
            $frontendStatus = 'verified';
        } elseif ($user->verification_status === 'pending') {
            $frontendStatus = 'pending';
        } elseif ($user->verification_status === 'denied') {
            $frontendStatus = 'rejected';
        } elseif ($user->verification_status === 'suspended') {
            $frontendStatus = 'suspended';
        } elseif ($user->verification_status === 'inactive') {
            $frontendStatus = 'inactive';
        }

        $mappedUser = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'user',
            'verification_status' => $frontendStatus,
            'status' => $frontendStatus,
            'verified' => $user->verified,
            'birthday' => $user->birthday,
            'gender' => $user->gender,
            'contact_number' => $user->contact_number,
            'course_year' => $user->course_year,
            'social_media_link' => $user->social_link,
            'profile_picture_url' => $user->profile_picture,
            'verification_document_url' => $user->verification_document,
            'bio' => $user->bio,
            'created_at' => $user->created_at
        ];

        return response()->json([
            'message' => 'User ' . implode(' and ', $updated) . ' updated successfully',
            'user' => $mappedUser
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to update user status: ' . $e->getMessage()], 500);
    }
});

// User deletion
Route::delete('/admin/users/{user}', function(\App\Models\User $user) {
    try {
        // Prevent deletion of admin users
        if ($user->role === 'admin') {
            return response()->json(['error' => 'Cannot delete admin users'], 403);
        }

        // Delete user's rentals first (or you might want to keep them)
        $user->rentals()->delete();
        
        // Delete the user
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to delete user: ' . $e->getMessage()], 500);
    }
});

// Account Verification Endpoints
Route::get('/admin/verification/pending', function() {
    try {
        $pendingUsers = User::where('verification_status', 'pending')
            ->whereNotNull('verification_document')
            ->orderBy('verification_submitted_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'date' => $user->verification_submitted_at ? $user->verification_submitted_at->format('Y-m-d') : null,
                    'profilePic' => $user->profile_picture ?: 'https://via.placeholder.com/50',
                    'proof' => $user->verification_document,
                    'documentType' => $user->verification_document_type,
                    'status' => $user->verification_status,
                    'course_year' => $user->course_year,
                    'contact_number' => $user->contact_number,
                    'bio' => $user->bio
                ];
            });

        return response()->json($pendingUsers);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch pending verifications: ' . $e->getMessage()], 500);
    }
});

Route::post('/admin/verification/{user}/approve', function(\App\Models\User $user) {
    try {
        $adminUser = auth()->user();
        
        $user->update([
            'verification_status' => 'approved',
            'verified' => true,
            'verification_reviewed_at' => now(),
            'verified_by' => $adminUser ? $adminUser->id : null
        ]);

        return response()->json([
            'message' => 'User verification approved successfully',
            'user' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to approve verification: ' . $e->getMessage()], 500);
    }
});

Route::post('/admin/verification/{user}/deny', function(\App\Models\User $user) {
    try {
        $adminUser = auth()->user();
        
        $user->update([
            'verification_status' => 'denied',
            'verified' => false,
            'verification_reviewed_at' => now(),
            'verified_by' => $adminUser ? $adminUser->id : null
        ]);

        return response()->json([
            'message' => 'User verification denied',
            'user' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to deny verification: ' . $e->getMessage()], 500);
    }
});

// Legacy routes for backward compatibility
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{user}', [UserController::class, 'show']);
Route::put('/users/{user}/verify', [UserController::class, 'verifyUser']);
