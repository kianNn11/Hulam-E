<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Simple test method
     */
    public function test()
    {
        return response()->json([
            'message' => 'AdminController is working!',
            'status' => 'success'
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats()
    {
        try {
            $totalUsers = User::count();
            $totalRentals = Rental::count();
            $activeRentals = Rental::where('status', 'active')->count();
            
            // Calculate total revenue (10% commission from all rentals)
            $totalRevenue = Rental::sum('price') * 0.10;
            
            // Get monthly stats for the current year
            $monthlyStats = Rental::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as rentals'),
                DB::raw('SUM(price) * 0.10 as revenue')
            )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

            return response()->json([
                'totalUsers' => $totalUsers,
                'totalRentals' => $totalRentals,
                'activeRentals' => $activeRentals,
                'totalRevenue' => round($totalRevenue, 2),
                'monthlyStats' => $monthlyStats
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch dashboard stats: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get recent transactions
     */
    public function getRecentTransactions()
    {
        try {
            $transactions = Rental::with(['user:id,name,email'])
                ->select('id', 'user_id', 'title', 'price', 'status', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($rental) {
                    return [
                        'id' => $rental->id,
                        'user' => $rental->user->name ?? 'Unknown User',
                        'email' => $rental->user->email ?? 'N/A',
                        'item' => $rental->title,
                        'amount' => round($rental->price * 0.10, 2), // 10% commission
                        'status' => $rental->status,
                        'date' => $rental->created_at->format('Y-m-d H:i:s'),
                        'type' => 'rental'
                    ];
                });

            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch transactions: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get recent activity
     */
    public function getRecentActivity()
    {
        try {
            $activities = collect();

            // Recent user registrations
            $newUsers = User::select('id', 'name', 'email', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'user' => $user->name,
                        'action' => 'registered',
                        'details' => "New user registration: {$user->email}",
                        'timestamp' => $user->created_at->format('Y-m-d H:i:s'),
                        'type' => 'user'
                    ];
                });

            // Recent rental postings
            $newRentals = Rental::with(['user:id,name'])
                ->select('id', 'user_id', 'title', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($rental) {
                    return [
                        'id' => $rental->id,
                        'user' => $rental->user->name ?? 'Unknown User',
                        'action' => 'posted rental',
                        'details' => "Posted: {$rental->title}",
                        'timestamp' => $rental->created_at->format('Y-m-d H:i:s'),
                        'type' => 'rental'
                    ];
                });

            $activities = $activities->merge($newUsers)->merge($newRentals);
            $activities = $activities->sortByDesc('timestamp')->take(10)->values();

            return response()->json($activities);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch activity: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get all users with pagination and filtering
     */
    public function getAllUsers(Request $request)
    {
        try {
            $query = User::query();

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Filter by role
            if ($request->has('role') && !empty($request->role)) {
                $query->where('role', $request->role);
            }

            // Filter by verification status
            if ($request->has('verified') && $request->verified !== '') {
                $query->where('verified', (bool) $request->verified);
            }

            // Get paginated results
            $perPage = $request->get('per_page', 15);
            $users = $query->withCount('rentals')
                          ->orderBy('created_at', 'desc')
                          ->paginate($perPage);

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch users: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get pending users (unverified)
     */
    public function getPendingUsers()
    {
        try {
            $pendingUsers = User::where('verified', false)
                              ->withCount('rentals')
                              ->orderBy('created_at', 'desc')
                              ->get();

            return response()->json($pendingUsers);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch pending users: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update user status (verify/unverify, change role)
     */
    public function updateUserStatus(Request $request, User $user)
    {
        try {
            $request->validate([
                'verified' => 'sometimes|boolean',
                'role' => 'sometimes|in:user,admin'
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

            $user->save();

            return response()->json([
                'message' => 'User ' . implode(' and ', $updated) . ' updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update user status: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete user (with protection for admins)
     */
    public function deleteUser(User $user)
    {
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
    }
}
