<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;

class InertiaLogoutResponse implements LogoutResponseContract
{
    public function toResponse($request)
    {
        if ($request instanceof Request && $request->inertia()) {
            return Inertia::location(route('login'));
        }

        return redirect()->route('login');
    }
}
