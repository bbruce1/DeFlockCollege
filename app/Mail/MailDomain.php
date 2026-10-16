<?php

declare(strict_types=1);

namespace App\Mail;

/**
 * Whether an address's domain can receive mail at all.
 *
 * Asked before a verification link is sent. A mistyped school domain
 * ("gse.cusd80.org", "connorsstudent.edu") is otherwise accepted, sent to, and
 * bounced back to our own inbox a minute later, while the student is told to
 * check a mailbox that does not exist. Checking DNS first turns that into an
 * error on the form, where they can still fix the spelling.
 *
 * A host with no MX record but an address record can still take mail (RFC 5321
 * section 5.1), so that counts as receiving. Only a domain with neither is
 * refused.
 */
class MailDomain
{
    public function receivesMail(string $email): bool
    {
        $host = strtolower(trim((string) substr(strrchr($email, '@') ?: '', 1)));

        if ($host === '') {
            return false;
        }

        // Fully qualified, so a resolver search domain can never make a typo
        // resolve to something on the server's own network.
        $fqdn = rtrim($host, '.').'.';

        return checkdnsrr($fqdn, 'MX') || checkdnsrr($fqdn, 'A') || checkdnsrr($fqdn, 'AAAA');
    }
}
