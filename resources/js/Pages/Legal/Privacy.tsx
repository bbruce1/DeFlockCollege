import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import Prose, { Section } from '@/Pages/Legal/Prose';

interface Props {
    updated: string;
    contact: string;
    operator: string;
}

export default function Privacy({ updated, contact, operator }: Props) {
    return (
        <Shell>
            <Head title="Privacy Policy" />

            <Prose
                title="Privacy Policy"
                standfirst="What this service collects, why, how long it is kept, and how to have it removed."
                updated={updated}
            >
                <Section heading="1. Introduction">
                    <p>
                        This Privacy Policy explains how {operator} (&ldquo;we&rdquo;,
                        &ldquo;us&rdquo;) handles personal data in connection with this website and
                        the services on it (the &ldquo;Service&rdquo;). It applies to visitors,
                        chapter creators, and people whose public office details appear on a
                        chapter page.
                    </p>
                    <p>
                        The short version: there are no accounts, no passwords, no advertising, no
                        analytics profiles, and no third-party trackers. The only personal data we
                        hold about a creator is an irreversible record derived from their email
                        address.
                    </p>
                </Section>

                <Section heading="2. Information we collect">
                    <p className="font-semibold text-glow">Information you provide directly</p>
                    <ul className="ml-5 grid list-disc gap-2">
                        <li>
                            <strong className="text-glow">Your email address</strong>, when you ask
                            to verify one or to be sent a replacement edit key. We use it to send
                            that message and we do not keep it. What is written to the chapter file
                            is a keyed one-way digest (HMAC-SHA256) of the address, which lets us
                            confirm an address someone later offers without storing the address
                            itself and without any way to work backwards to it.
                        </li>
                        <li>
                            <strong className="text-glow">Chapter details</strong> — school name,
                            city and state, the campus point you select, social handles, and any
                            petition link. This is published on your chapter page.
                        </li>
                        <li>
                            <strong className="text-glow">Officials&rsquo; details you add</strong>{' '}
                            — name, title, role, and any public contact address or link. This is
                            personal data about other people, it is stored in plain form because it
                            has to be displayed and used, and it is published on your chapter page.
                            See section 8.
                        </li>
                        <li>
                            <strong className="text-glow">Your edit key</strong>, stored only as a
                            bcrypt hash. We cannot read it or recover it.
                        </li>
                    </ul>

                    <p className="mt-2 font-semibold text-glow">Information collected automatically</p>
                    <ul className="ml-5 grid list-disc gap-2">
                        <li>
                            <strong className="text-glow">Rate-limiting counters.</strong> To stop
                            the verification and edit endpoints being abused, we count recent
                            requests against a keyed digest of your IP address. The digest is held
                            in a short-lived cache, expires within an hour, and is not reversible
                            to your IP address.
                        </li>
                        <li>
                            <strong className="text-glow">Server logs.</strong> Our hosting
                            infrastructure records ordinary web server logs, which may include IP
                            addresses, timestamps, requested pages, and user-agent strings. These
                            are used for security and diagnosing faults.
                        </li>
                        <li>
                            <strong className="text-glow">A session cookie.</strong> Strictly
                            necessary, used to protect forms against cross-site request forgery and
                            to carry your edit key to the screen that shows it once. It contains no
                            identifier for you and is not used for tracking.
                        </li>
                    </ul>

                    <p className="mt-2">
                        We do not use advertising cookies, analytics cookies, pixels, fingerprinting,
                        or any third-party tracking, and we do not build profiles of visitors.
                        Sending the letter from a chapter page opens your own email client — nothing
                        about that message reaches us, and reading a chapter page requires nothing
                        from you at all.
                    </p>
                </Section>

                <Section heading="3. How we use information">
                    <p>We use the information above only to:</p>
                    <ul className="ml-5 grid list-disc gap-2">
                        <li>verify that someone controls a school email address before they create a chapter;</li>
                        <li>confirm that a person asking to edit or recover a chapter is the one who created it;</li>
                        <li>build and publish the chapter page you asked for;</li>
                        <li>send you the small number of transactional emails the Service depends on;</li>
                        <li>keep the Service available, secure, and within the limits of the free data sources it uses;</li>
                        <li>comply with law and respond to valid legal requests.</li>
                    </ul>
                    <p>
                        We do not sell personal data, share it for advertising, or use it for
                        automated decision-making or profiling.
                    </p>
                </Section>

                <Section heading="4. Legal bases (UK/EU visitors)">
                    <p>
                        Where the UK GDPR or EU GDPR applies, we rely on: performance of a contract
                        (providing the Service you asked for); legitimate interests (keeping the
                        Service secure and preventing abuse, and publishing information about
                        public offices in their public capacity); and legal obligation where one
                        applies. Where we rely on legitimate interests, you may object as described
                        in section 9.
                    </p>
                </Section>

                <Section heading="5. Cookies">
                    <p>
                        We set one strictly necessary session cookie. Because it is essential to
                        the Service and is not used for analytics or advertising, no consent banner
                        is required and none is shown. You can block cookies in your browser, but
                        forms on the Service will stop working.
                    </p>
                </Section>

                <Section heading="6. Service providers and disclosure">
                    <p>We share personal data only with:</p>
                    <ul className="ml-5 grid list-disc gap-2">
                        <li>
                            <strong className="text-glow">Our email provider</strong>, which
                            transmits verification and edit-key messages and necessarily processes
                            the recipient address.
                        </li>
                        <li>
                            <strong className="text-glow">Our hosting provider</strong>, which
                            operates the servers the Service runs on.
                        </li>
                    </ul>
                    <p>
                        We may also disclose information where required by law, to enforce our{' '}
                        <Link href="/terms" className="text-net">
                            Terms
                        </Link>
                        , or to protect the rights and safety of any person.
                    </p>
                    <p>
                        Queries for map data are made by our servers to OpenStreetMap services.
                        Those requests carry our identification, not yours; your browser does not
                        contact them.
                    </p>
                </Section>

                <Section heading="7. Retention">
                    <p>
                        Chapter content and the ownership digest are kept for as long as the
                        chapter exists, and are deleted when it is removed. Rate-limiting counters
                        expire within an hour. Email addresses are not retained after a message is
                        sent. Server logs are kept only as long as needed for security and
                        diagnostics. Backups containing removed content are overwritten in the
                        ordinary course.
                    </p>
                </Section>

                <Section heading="8. If your details appear on a chapter page">
                    <p>
                        Chapter creators may list public officials — councillors, sheriffs, police
                        and campus leadership, and state legislators — with the public contact
                        details for those offices, so that students can write to them. This
                        concerns those individuals in their public and professional capacity only.
                    </p>
                    <p>
                        If your details appear and you want them corrected or removed, write to{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>
                        . We will act promptly, and you do not need to explain why.
                    </p>
                </Section>

                <Section heading="9. Your rights">
                    <p>
                        Depending on where you live, you may have the right to access, correct,
                        delete, restrict, or object to our processing of your personal data, to
                        data portability, and to withdraw consent. Californian residents have the
                        rights to know, delete, correct, and opt out of sale or sharing under the
                        CCPA as amended — we do not sell or share personal data, and we will never
                        discriminate against you for exercising a right.
                    </p>
                    <p>
                        Exercise any of these by writing to{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>
                        . One practical note: because a creator&rsquo;s email address is kept only
                        as an irreversible digest, we cannot search for you by address. Tell us
                        which chapter you mean and we can confirm the match and act on it.
                    </p>
                    <p>
                        If you are in the UK or EU you also have the right to complain to your data
                        protection authority.
                    </p>
                </Section>

                <Section heading="10. Security">
                    <p>
                        Edit keys are stored as bcrypt hashes and email addresses as keyed digests,
                        so neither can be read from our files. Traffic is served over HTTPS,
                        state-changing requests carry cross-site request forgery protection, and
                        sensitive endpoints are rate limited. There is no database of users and no
                        credential store to breach.
                    </p>
                    <p>
                        No method of transmission or storage is completely secure, and we cannot
                        guarantee absolute security. Anything published on a chapter page is public
                        by design.
                    </p>
                </Section>

                <Section heading="11. Children&rsquo;s privacy">
                    <p>
                        The Service is not directed at children under 13 and we do not knowingly
                        collect their personal data. Because chapters may be created at secondary
                        schools, some creators may be minors; see section 2 of the{' '}
                        <Link href="/terms" className="text-net">
                            Terms
                        </Link>
                        . If you believe a child under 13 has provided us with personal data, write
                        to{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>{' '}
                        and we will delete it.
                    </p>
                </Section>

                <Section heading="12. International transfers">
                    <p>
                        The Service is operated from the United States, and our providers may
                        process data there. If you use the Service from elsewhere, you understand
                        that your information will be processed in the United States, where data
                        protection law may differ from that of your country.
                    </p>
                </Section>

                <Section heading="13. Changes to this policy">
                    <p>
                        We may update this Privacy Policy. The date at the top of this page records
                        the last material change, and continuing to use the Service after a change
                        means you accept it.
                    </p>
                </Section>

                <Section heading="14. Contact">
                    <p>
                        Questions, requests, and removals go to{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>
                        .
                    </p>
                </Section>
            </Prose>
        </Shell>
    );
}
