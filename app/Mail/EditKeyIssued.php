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
 * A replacement edit key, sent to the address that created the chapter.
 *
 * Sending a credential by email is only defensible because that mailbox is
 * already the proof of ownership: whoever holds it can re-verify and be issued
 * a new key anyway, so the mail is no weaker than the door it opens.
 *
 * The key inside is new. The previous one stopped working the moment this was
 * sent, which is said plainly so a creator who did not ask for it knows
 * something happened.
 */
final class EditKeyIssued extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $editKey,
        public readonly string $schoolName,
        public readonly string $chapterUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your new edit key for {$this->schoolName}",
            replyTo: array_filter([config('mail.reply_to.address')]),
        );
    }

    public function headers(): Headers
    {
        return new Headers(text: array_filter([
            'Auto-Submitted' => 'auto-generated',
            'X-Auto-Response-Suppress' => 'OOF, AutoReply',
            'List-Unsubscribe' => config('mail.reply_to.address')
                ? '<mailto:'.config('mail.reply_to.address').'?subject=unsubscribe>'
                : null,
        ]));
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.edit-key');
    }
}
