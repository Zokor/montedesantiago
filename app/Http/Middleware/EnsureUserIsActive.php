<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
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

        // If the user is authenticated but marked as inactive/blocked,
        // log them out and redirect to the login page.
        if ($user && $user->is_active === false) {
            Auth::logout();

            // For JSON/API requests, return a 403 response.
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your account is blocked.'], 403);
            }

            // For typical web requests, redirect to login.
            return redirect()->route('login');
        }

        return $next($request);
    }
}
