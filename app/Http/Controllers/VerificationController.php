<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Chapters\Ownership;
use App\Chapters\SchoolDomain;
use App\Chapters\VerificationTicket;
use App\Mail\VerificationLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use InvalidArgumentException;

/**
 * Sends the link that proves somebody controls a school address.
 *
 * Enumeration is handled by splitting where information is revealed: this
 * endpoint answers identically whether or not a chapter already exists, so an
 * unverified stranger learns nothing about which schools are taken. Once the
 * link is opened, and control of the address is proved, the create page says
 * plainly that the chapter exists and links to it.
 */
final class VerificationController extends Controller
{
    /** Per address, so one mailbox cannot be flooded. */
    private const MAX_PER_EMAIL_PER_HOUR = 5;

    /** Per client, so we cannot be used as a relay to many addresses. */
    private const MAX_PER_IP_PER_HOUR = 10;

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'purpose' => ['nullable', 'string', 'in:create,edit'],
        ]);

        $email = Ownership::normalise($validated['email']);
        $purpose = $validated['purpose'] ?? 'create';

        try {
            $domain = SchoolDomain::fromEmail($email);
        } catch (InvalidArgumentException $e) {
            // The domain rule is a stated requirement, not a secret, so saying why
            // costs nothing and saves the person a guess.
            return back()->withErrors(['email' => $e->getMessage()])->withInput();
        }

        if ($limit = $this->exceededLimit($request, $email)) {
            return back()->withErrors(['email' => $limit])->withInput();
        }

        $ticket = VerificationTicket::issue($email, $purpose);
        $schoolName = $domain->known()[0] ?? $domain->registrable;

        Mail::to($email)->send(new VerificationLink(
            url: route('chapters.start', ['ticket' => $ticket->toToken()]),
            schoolName: $schoolName,
            minutesValid: VerificationTicket::LIFETIME_MINUTES,
            isEdit: $purpose === 'edit',
        ));

        // Identical wording regardless of what exists at that domain.
        return back()->with('status', "Check {$email}. The link works for "
            .VerificationTicket::LIFETIME_MINUTES.' minutes.');
    }

    private function exceededLimit(Request $request, string $email): ?string
    {
        // Keyed on the HMAC rather than the address, so the rate limiter's own
        // store never holds an email in the clear.
        $emailKey = 'verify-email:'.Ownership::record($email);
        $ipKey = 'verify-ip:'.sha1((string) $request->ip());

        if (RateLimiter::tooManyAttempts($emailKey, self::MAX_PER_EMAIL_PER_HOUR)) {
            $minutes = (int) ceil(RateLimiter::availableIn($emailKey) / 60);

            return "That address has been sent several links already. Try again in {$minutes} minutes.";
        }

        if (RateLimiter::tooManyAttempts($ipKey, self::MAX_PER_IP_PER_HOUR)) {
            $minutes = (int) ceil(RateLimiter::availableIn($ipKey) / 60);

            return "Too many requests from this connection. Try again in {$minutes} minutes.";
        }

        RateLimiter::hit($emailKey, 3600);
        RateLimiter::hit($ipKey, 3600);

        return null;
    }
}
