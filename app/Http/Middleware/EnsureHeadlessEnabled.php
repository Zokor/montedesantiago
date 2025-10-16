<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnsureHeadlessEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->isHeadlessEnabled()) {
            return $next($request);
        }

        abort(404);
    }

    /**
     * Determine if the headless API is enabled.
     */
    private function isHeadlessEnabled(): bool
    {
        $default = (bool) config('cms.headless_enabled', true);

        return Cache::remember('settings.headless_enabled', 60, function () use ($default) {
            $setting = Setting::query()
                ->where('group', 'features')
                ->where('key', 'headless')
                ->first();

            if (! $setting) {
                return $default;
            }

            return (bool) ($setting->value['enabled'] ?? $default);
        });
    }
}
