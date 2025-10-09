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
     * Enable MFA: generate secret and QR code for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function enableMfa(Request $request)
    {
        $user = $request->user();

        // Generate a new secret if not already present
        if (empty($user->two_factor_secret)) {
            $secret = $this->google2fa->generateSecretKey();
            $user->two_factor_secret = Crypt::encryptString($secret);
            $user->save();
        } else {
            $secret = Crypt::decryptString($user->two_factor_secret);
        }

        // Generate QR code URL (Google Authenticator compatible)
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return response()->json([
            'message' => 'MFA secret generated.',
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
