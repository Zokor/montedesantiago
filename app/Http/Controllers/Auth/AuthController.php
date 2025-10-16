<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Show the login view.
     *
     * @return \Illuminate\View\View
     */
    public function showLogin()
    {
        // Not used in API context; return JSON placeholder
        return response()->json(['message' => 'Login view endpoint']);
    }

    /**
     * Handle a login request.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
        $this->ensureIsNotRateLimited($request);

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey($request), 60);
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        RateLimiter::clear($this->throttleKey($request));

        $user = $request->user();
        $user->last_login_at = Carbon::now();
        $user->last_login_ip = $request->ip();
        $user->save();

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $user->only(['id', 'name', 'email']),
        ]);
    }

    /**
     * Handle a logout request.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->inertia()) {
            return Inertia::location(route('login'));
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logged out successfully.']);
        }

        return redirect()->route('login');
    }

    /**
     * Ensure the login request is not rate limited.
     *
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function ensureIsNotRateLimited(Request $request)
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => ["Too many login attempts. Try again in {$seconds} seconds."],
        ]);
    }

    /**
     * Build the rate limiter key.
     *
     * @return string
     */
    protected function throttleKey(Request $request)
    {
        return strtolower($request->input('email')).'|'.$request->ip();
    }
}
