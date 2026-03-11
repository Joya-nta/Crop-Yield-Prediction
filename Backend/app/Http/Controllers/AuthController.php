<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validateuser = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'email|max:255|unique:users',
            'mobile' => 'required|string|max:10|unique:users',
            'password' => 'required|string|min:8',
            'state' => 'required|string|max:255',
        ]);

        if ($validateuser->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validateuser->errors()->toArray()
            ], 401);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
            'state' => $request->state,
        ]);
        return response()->json([
            'user' => $user,
            'message' => 'User Registered Successfully',
            'status' => true
        ], 200);
    }

    public function login(Request $request)
    {
        $validateuser = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validateuser->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'validation error',
                'errors' => $validateuser->errors()->all()
            ], 401);
        }
        $loginType = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'mobile';
        $request->merge([$loginType => $request->email]);
        $credentials = $request->only($loginType, 'password');
        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            return response()->json([
                'status' => true,
                'message' => 'User Logged In Successfully',
                'user' => $user,
                'token' => $user->createToken('auth_token')->plainTextToken,
                'token_type' => 'Bearer',
            ], 200);
        } else {
            return response()->json([
                'status' => false,
                'message' => 'Email or mobile no & Password does not matched.',
            ], 401);
        }
    }
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'You Logged Out Successfully',
        ], 200);
    }
}

