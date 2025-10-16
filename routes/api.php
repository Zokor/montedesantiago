<?php

use App\Http\Controllers\Api\V1\CollectionController;
use App\Http\Controllers\Api\V1\ComponentController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\PageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->middleware(['headless'])
    ->group(function () {
        Route::get('pages', [PageController::class, 'index']);
        Route::get('pages/{page:slug}', [PageController::class, 'show']);

        Route::get('collections', [CollectionController::class, 'index']);
        Route::get('collections/{collection:slug}', [CollectionController::class, 'show']);

        Route::get('components', [ComponentController::class, 'index']);
        Route::get('components/{component:slug}', [ComponentController::class, 'show']);

        Route::get('media', [MediaController::class, 'index']);
        Route::get('media/{media}', [MediaController::class, 'show']);
    });
