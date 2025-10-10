<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class MfaController extends Controller
{
    protected $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Enable MFA for another user (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function enableMfaForUser(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $admin = $request->user();

        // Check if user has admin/webmaster role
        if (!$admin->hasRole('admin') && !$admin->hasRole('webmaster')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $targetUser = \App\Models\User::findOrFail($request->input('user_id'));

        // Don't allow enabling MFA for yourself through this method
        if ($targetUser->id === $admin->id) {
            return response()->json(['message' => 'Use the regular MFA enable endpoint for yourself.'], 400);
        }

        // Generate a new secret for the target user
        $secret = $this->google2fa->generateSecretKey();
        $targetUser->two_factor_secret = Crypt::encryptString($secret);
        $targetUser->save();

        // Generate QR code URL (Google Authenticator compatible)
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $targetUser->email,
            $secret
        );

        return response()->json([
            'message' => 'MFA secret generated for user.',
            'user_id' => $targetUser->id,
            'user_email' => $targetUser->email,
            'qr_code_url' => $qrCodeUrl,
            'secret' => $secret,
        ]);
    }

    /**
     * Verify the TOTP code and enable MFA for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function verifyAndEnableMfa(Request $request)
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();

        if (empty($user->two_factor_secret)) {
            throw ValidationException::withMessages(['code' => ['MFA secret not generated.']]);
        }

        $secret = Crypt::decryptString($user->two_factor_secret);

        if (! $this->google2fa->verifyKey($secret, $request->input('code'))) {
            throw ValidationException::withMessages(['code' => ['Invalid verification code.']]);
        }

        // Mark MFA as confirmed
        $user->two_factor_confirmed_at = Carbon::now();
        $user->is_mfa_enabled = true;

        // Generate 10 backup codes (hashed for security)
        $backupCodes = collect(range(1, 10))->map(function () {
            $code = Str::random(10);
            return Hash::make($code);
        })->toArray();

        $user->two_factor_recovery_codes = json_encode($backupCodes);
        $user->save();

        return response()->json(['message' => 'MFA enabled successfully.']);
    }

    /**
     * Disable MFA for the user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function disableMfa(Request $request)
    {
        $user = $request->user();

        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_confirmed_at = null;
        $user->is_mfa_enabled = false;
        $user->save();

        return response()->json(['message' => 'MFA disabled successfully.']);
    }

    /**
     * Verify MFA code during login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function verifyMfa(Request $request)
    {
        $request->validate([
            'code' => ['required'],
        ]);

        $user = $request->user();

        // Check backup codes first
        $recoveryCodes = $user->two_factor_recovery_codes ? json_decode($user->two_factor_recovery_codes, true) : [];

        foreach ($recoveryCodes as $key => $encrypted) {
            if (Hash::check($request->input('code'), $encrypted)) {
                // Remove used backup code
                unset($recoveryCodes[$key]);
                $user->two_factor_recovery_codes = json_encode(array_values($recoveryCodes));
                $user->save();

                return response()->json(['message' => 'MFA verified with backup code.']);
            }
        }

        // Verify TOTP
        $secret = $user->two_factor_secret ? Crypt::decryptString($user->two_factor_secret) : null;

        if (! $secret || ! $this->google2fa->verifyKey($secret, $request->input('code'))) {
            throw ValidationException::withMessages(['code' => ['Invalid MFA code.']]);
        }

        return response()->json(['message' => 'MFA verified successfully.']);
    }
}
