<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);
        $user->assignRole('customer');

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load('seller');
        $user->setAttribute('roles', $user->getRoleNames());

        return response()->json([
            'success' => true,
            'data' => ['user' => $user, 'token' => $token],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!\Illuminate\Support\Facades\Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'E-posta veya şifre hatalı.'], 401);
        }

        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load('seller');
        $user->setAttribute('roles', $user->getRoleNames());

        return response()->json([
            'success' => true,
            'data' => ['user' => $user, 'token' => $token],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Çıkış yapıldı.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('seller');
        $user->setAttribute('roles', $user->getRoleNames());
        return response()->json(['success' => true, 'data' => $user]);
    }
}
