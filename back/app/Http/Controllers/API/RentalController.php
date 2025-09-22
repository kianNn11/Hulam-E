<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        // Always eager load 'images' relationship
        $query = Rental::with(['user:id,name,email', 'images']);
        
        // Filter by user if requested
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        } else {
            // Only show available rentals in the public rental section
            $query->where('status', 'available');
        }

        // Add search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        // Order by newest first
        $query->orderBy('created_at', 'desc');

        $rentals = $query->paginate(12);

        return response()->json([
            'data' => collect($rentals->items())->map(function($rental) {
                $rentalArr = $rental->toArray();
                $rentalArr['image_url'] = $rental->image ? asset('storage/' . $rental->image) : null;
                $rentalArr['images_url'] = $rental->images ? $rental->images->map(function($img) { return asset('storage/' . $img->image_path); }) : [];
                return $rentalArr;
            }),
            'meta' => [
                'current_page' => $rentals->currentPage(),
                'total' => $rentals->total(),
                'per_page' => $rentals->perPage(),
                'last_page' => $rentals->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:3|max:255',
            'description' => 'required|string|min:10|max:1000',
            'price' => 'required|numeric|min:0.01',
            'location' => 'required|string|min:2|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:15360', // legacy single image
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif|max:15360',
        ], [
            'title.required' => 'Title is required',
            'title.min' => 'Title must be at least 3 characters',
            'title.max' => 'Title cannot exceed 255 characters',
            'description.required' => 'Description is required',
            'description.min' => 'Description must be at least 10 characters',
            'description.max' => 'Description cannot exceed 1000 characters',
            'price.required' => 'Price is required',
            'price.min' => 'Price must be greater than 0',
            'location.required' => 'Location is required',
            'location.min' => 'Location must be at least 2 characters',
            'image.image' => 'File must be an image',
            'image.max' => 'Image size cannot exceed 15MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $rentalData = [
            'title' => trim($request->title),
            'description' => trim($request->description),
            'price' => $request->price,
            'location' => trim($request->location),
            'user_id' => $request->user()->id,
            'status' => 'available', // Default status
        ];

        $mainImagePath = null;

        // Handle legacy single image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $image->getClientOriginalName());
            $imagePath = $image->storeAs('rentals', $imageName, 'public');
            $mainImagePath = $imagePath;
            $rentalData['image'] = $imagePath;
        }

        // Handle multiple images upload (only save the first image if present)
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            if (is_array($images) && count($images) > 0) {
                $img = $images[0];
                $imgName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $img->getClientOriginalName());
                $imgPath = $img->storeAs('rentals', $imgName, 'public');
                $mainImagePath = $imgPath;
            }
        }

        // Always set the main image path if available
        if ($mainImagePath) {
            $rentalData['image'] = $mainImagePath;
        }

        $rental = Rental::create($rentalData);

        // Save the main image in rental_images table if available
        if ($mainImagePath) {
            $rental->images()->create(['image_path' => $mainImagePath]);
        }

        $rental->load('user:id,name,email', 'images');

        $rentalArr = $rental->toArray();
        $rentalArr['image_url'] = $rental->image ? asset('storage/' . $rental->image) : null;
        $rentalArr['images_url'] = ($rental->images && $rental->images->count() > 0)
            ? [asset('storage/' . $rental->images->first()->image_path)]
            : [];

        return response()->json([
            'data' => $rentalArr,
            'message' => 'Rental posted successfully! Your item is now available for rent.'
        ], 201);
    }

    public function show(Rental $rental)
    {
        $rental->load('user:id,name,email,contact_number', 'images');
        $rentalArr = $rental->toArray();
        $rentalArr['image_url'] = $rental->image ? asset('storage/' . $rental->image) : null;
        $rentalArr['images_url'] = $rental->images ? $rental->images->map(function($img) { return asset('storage/' . $img->image_path); }) : [];
        return response()->json([
            'data' => $rentalArr
        ]);
    }

    public function update(Request $request, Rental $rental)
    {
        // Check if user owns the rental
        if ($rental->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|min:3|max:255',
            'description' => 'sometimes|string|min:10|max:1000',
            'price' => 'sometimes|numeric|min:0.01',
            'location' => 'sometimes|string|min:2|max:255',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:15360',
            'status' => 'sometimes|in:available,rented,unavailable',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif|max:15360',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['title', 'description', 'price', 'location', 'status']);

        // Handle legacy single image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($rental->image && Storage::disk('public')->exists($rental->image)) {
                Storage::disk('public')->delete($rental->image);
            }

            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $image->getClientOriginalName());
            $imagePath = $image->storeAs('rentals', $imageName, 'public');
            $updateData['image'] = $imagePath;
        }

        $rental->update($updateData);

        // Handle new images upload (replace existing with only the first new image if present)
        if ($request->hasFile('images')) {
            // Delete all previous images
            foreach ($rental->images as $oldImg) {
                if (Storage::disk('public')->exists($oldImg->image_path)) {
                    Storage::disk('public')->delete($oldImg->image_path);
                }
                $oldImg->delete();
            }
            $images = $request->file('images');
            if (is_array($images) && count($images) > 0) {
                $img = $images[0];
                $imgName = time() . '_' . uniqid() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $img->getClientOriginalName());
                $imgPath = $img->storeAs('rentals', $imgName, 'public');
                $rental->images()->create(['image_path' => $imgPath]);
            }
        }

        $rental->load('user:id,name,email', 'images');

        $rentalArr = $rental->toArray();
        $rentalArr['image_url'] = $rental->image ? asset('storage/' . $rental->image) : null;
        $rentalArr['images_url'] = ($rental->images && $rental->images->count() > 0)
            ? [asset('storage/' . $rental->images->first()->image_path)]
            : [];

        return response()->json([
            'data' => $rentalArr,
            'message' => 'Rental updated successfully'
        ]);
    }

    public function destroy(Rental $rental, Request $request)
    {
        // Check if user owns the rental
        if ($rental->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated image
        if ($rental->image && Storage::disk('public')->exists($rental->image)) {
            Storage::disk('public')->delete($rental->image);
        }

        $rental->delete();

        return response()->json([
            'message' => 'Rental deleted successfully'
        ]);
    }
}
