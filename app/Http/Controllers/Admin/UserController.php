<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\UserInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim();
        $status = $request->get('status');
        $perPage = (int) $request->integer('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $users = User::query()
            ->with('roles:id,name')
            ->when($search->isNotEmpty(), function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), function ($query) use ($status) {
                $query->where('is_active', $status === 'active');
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $payload = UserResource::collection($users)->response($request)->getData(true);

        if ($request->wantsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('users/index', [
            'users' => $payload,
            'filters' => [
                'search' => $search->toString(),
                'status' => $status,
            ],
            'availableRoles' => Role::orderBy('name')->pluck('name'),
            'canManageUsers' => $request->user()->hasAnyRole(['admin', 'editor']),
            'canInviteUsers' => $request->user()->hasRole('admin'),
            'showPagination' => $users->total() > $users->perPage(),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        abort_unless($request->user()->hasRole('admin'), 403);

        $data = $request->validated();
        $temporaryPassword = Str::random(12);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($temporaryPassword),
            'is_active' => true,
        ]);

        $user->syncRoles([$data['role']]);

        $token = Password::broker()->createToken($user);
        $setupUrl = URL::route('password.reset', ['token' => $token, 'email' => $user->email]);

        $user->notify(new UserInvitationNotification($setupUrl, $temporaryPassword));

        return back()->with('userCreated', [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $data['role'],
            'setupUrl' => $setupUrl,
            'temporaryPassword' => $temporaryPassword,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        abort_unless($request->user()->hasAnyRole(['admin', 'editor']), 403);

        $user->update([
            'is_active' => $data['is_active'],
        ]);

        return back()->with('userUpdated', [
            'id' => $user->id,
            'is_active' => $user->is_active,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        abort_unless($request->user()->hasAnyRole(['admin', 'editor']), 403);

        $request->validate([
            'confirmation' => ['required', 'in:I Confirm'],
        ]);

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return back()->with('userDeleted', [
            'id' => $user->id,
            'email' => $user->email,
        ]);
    }
}
