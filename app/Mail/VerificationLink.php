<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

/**
 * The only email this application sends.
 *
 * It carries one link and asks for nothing. There is no account to confirm and
 * no password to set, so the link is the entire mechanism.
 *
 * Shaped deliberately to survive a university spam filter, which is the hardest
 * audience this ever has to reach. A short message whose only content is a
 * button hiding a URL is exactly the shape of a phishing mail, so the address is
 * also printed in full, a human reply-to is offered, and the message declares
 * itself as automated rather than bulk.
 */
final class VerificationLink extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $url,
        public readonly string $schoolName,
        public readonly int $minutesValid,
        public readonly bool $isEdit,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isEdit
                ? "Edit your {$this->schoolName} chapter"
                : "Start the {$this->schoolName} chapter",
            // A reachable human on the sending domain. Filters weigh an
            // unroutable or absent reply-to against the sender.
            replyTo: array_filter([config('mail.reply_to.address')]),
        );
    }

    public function headers(): Headers
    {
        return new Headers(text: array_filter([
            // Marks this as a machine-generated reply to a user action rather
            // than a campaign, which is what it actually is.
            'Auto-Submitted' => 'auto-generated',
            'X-Auto-Response-Suppress' => 'OOF, AutoReply',
            // Present even on transactional mail: its absence is itself a
            // negative signal at several large providers.
            'List-Unsubscribe' => config('mail.reply_to.address')
                ? '<mailto:'.config('mail.reply_to.address').'?subject=unsubscribe>'
                : null,
        ]));
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.verification-link');
    }
}
