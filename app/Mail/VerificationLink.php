<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * The only email this application sends.
 *
 * It carries one link and asks for nothing. There is no account to confirm and
 * no password to set, so the link is the entire mechanism.
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
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.verification-link');
    }
}
