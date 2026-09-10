import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import Prose, { Section } from '@/Pages/Legal/Prose';

interface Props {
    updated: string;
    contact: string;
    operator: string;
    jurisdiction: string;
}

export default function Terms({ updated, contact, operator, jurisdiction }: Props) {
    return (
        <Shell>
            <Head title="Terms of Service" />

            <Prose
                title="Terms of Service"
                standfirst="The agreement between you and the operator of this service. Please read it before creating a chapter."
                updated={updated}
            >
                <Section heading="1. Agreement to these terms">
                    <p>
                        These Terms of Service (the &ldquo;Terms&rdquo;) are a binding agreement
                        between you and {operator} (&ldquo;we&rdquo;, &ldquo;us&rdquo;), which
                        operates this website and the services on it (the &ldquo;Service&rdquo;).
                        By accessing the Service, creating a chapter, or using any feature of it,
                        you agree to these Terms. If you do not agree, do not use the Service.
                    </p>
                    <p>
                        If you are creating a chapter on behalf of a group, you represent that you
                        have authority to bind that group to these Terms.
                    </p>
                </Section>

                <Section heading="2. Eligibility">
                    <p>
                        You must be at least 13 years old to use the Service. If you are under 18,
                        you may use it only with the involvement of a parent or legal guardian, who
                        agrees to these Terms on your behalf. You must not use the Service if you
                        are barred from doing so under applicable law.
                    </p>
                    <p>
                        Creating a chapter requires you to verify control of an email address at a{' '}
                        <code>.edu</code> or <code>.org</code> domain, and you represent that you
                        are genuinely connected to the campus your chapter names.
                    </p>
                </Section>

                <Section heading="3. What the Service is">
                    <p>
                        The Service generates and hosts a public informational page for a campus
                        group concerned with automated license plate readers. It draws counts of
                        mapped readers from OpenStreetMap, presents publicly available information
                        about elected and appointed offices, and links to social accounts and
                        petitions that chapter creators supply.
                    </p>
                    <p>
                        We provide no accounts, no messaging, no comments, and no forums. The
                        Service is provided free of charge, and we may change, suspend, or
                        discontinue any part of it at any time.
                    </p>
                </Section>

                <Section heading="4. Chapters are run by students, not by schools">
                    <p>
                        A chapter is created and run by a student or students at that campus. It
                        is{' '}
                        <strong className="text-glow">
                            not affiliated with, endorsed by, sponsored by, or operated by
                        </strong>{' '}
                        the school it is named for, nor by us. A school&rsquo;s name is used
                        nominatively, to identify which campus a chapter concerns, and for no other
                        purpose. Logos, seals, marks, and mascots are never used.
                    </p>
                    <p>
                        If you are a representative of a named institution and object to a chapter,
                        write to{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>
                        . See section 11.
                    </p>
                </Section>

                <Section heading="5. Your edit key">
                    <p>
                        When you create a chapter you are issued a single edit key. It is stored
                        only as a one-way hash, which means we cannot read it, recover it, or send
                        it to you again. You are responsible for keeping it confidential and for
                        all activity conducted with it.
                    </p>
                    <p>
                        A replacement can be issued to the verified email address that created the
                        chapter. Issuing a replacement immediately invalidates the previous key.
                        Notify us promptly at{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>{' '}
                        if you believe your key has been disclosed.
                    </p>
                </Section>

                <Section heading="6. Acceptable use">
                    <p>You agree that you will not, and will not permit anyone else to:</p>
                    <ul className="ml-5 grid list-disc gap-2">
                        <li>
                            touch, damage, obstruct, obscure, disable, or otherwise interfere with
                            any camera or other equipment, or use the Service to organise,
                            encourage, or celebrate doing so;
                        </li>
                        <li>
                            harass, threaten, defame, dox, or incite violence against any person,
                            including any official listed on a chapter page;
                        </li>
                        <li>
                            claim a campus you have no genuine connection to, impersonate any
                            person or institution, or misrepresent your affiliation;
                        </li>
                        <li>
                            submit information you know to be false, including inaccurate contact
                            details for any office;
                        </li>
                        <li>
                            use the Service to send bulk, automated, or commercial messages, or to
                            collect addresses for those purposes;
                        </li>
                        <li>
                            probe, scan, overload, or attempt to gain unauthorised access to the
                            Service, its infrastructure, or any other user&rsquo;s chapter;
                        </li>
                        <li>
                            scrape or harvest the Service by automated means beyond ordinary search
                            engine indexing, or place unreasonable load on the third-party data
                            sources it depends on;
                        </li>
                        <li>violate any applicable law or regulation.</li>
                    </ul>
                </Section>

                <Section heading="7. Never vandalize">
                    <p>
                        This deserves stating on its own. Damaging a camera is a crime, it hands
                        opponents the story they want, and in many jurisdictions a conviction costs
                        a student the vote they were trying to use. Nothing on this Service is an
                        invitation to interfere with equipment or property.
                    </p>
                    <p>
                        Using the Service to organise or encourage damage to property, harassment,
                        or any other unlawful act is a material breach of these Terms, and the
                        chapter will be removed without notice.
                    </p>
                </Section>

                <Section heading="8. Content you provide">
                    <p>
                        You retain ownership of the content you submit. By submitting it, you grant
                        us a worldwide, non-exclusive, royalty-free license to host, store,
                        reproduce, and display that content for the purpose of operating and
                        promoting the Service. This license ends when the content is removed,
                        except for copies retained in backups for a reasonable period.
                    </p>
                    <p>
                        You represent and warrant that you have the rights necessary to submit the
                        content, and that it does not infringe any third party&rsquo;s rights or
                        violate any law.
                    </p>
                    <p>
                        <strong className="text-glow">
                            Contact details you add for public officials are personal data
                            concerning other people.
                        </strong>{' '}
                        You are responsible for ensuring that any name, title, address, or link you
                        add is accurate, is drawn from a genuinely public source, and relates to a
                        person in their public or professional capacity. Do not add the private
                        contact details of any individual.
                    </p>
                </Section>

                <Section heading="9. Third-party services, links, and data">
                    <p>
                        Chapter pages link to social accounts, petitions, and government websites
                        that we do not control. Those destinations have their own terms and privacy
                        practices, we do not monitor or moderate them, and a link is not an
                        endorsement. You use them at your own risk.
                    </p>
                    <p>
                        Reader counts and geographic data are contributed by volunteers to
                        OpenStreetMap and made available under the Open Database Licence. They are
                        a floor rather than a census, may be incomplete or out of date, and are
                        provided for information only.
                    </p>
                </Section>

                <Section heading="10. Intellectual property">
                    <p>
                        The Service, including its software, design, and text, is owned by us or
                        our licensors and is protected by intellectual property law. Nothing in
                        these Terms transfers any right in it to you except the limited right to use
                        the Service in accordance with these Terms.
                    </p>
                    <p>
                        Names and marks of institutions, vendors, and platforms referred to on the
                        Service belong to their respective owners and are used nominatively.
                    </p>
                </Section>

                <Section heading="11. Removal, suspension, and termination">
                    <p>
                        We may remove any chapter or content, or suspend or terminate access to the
                        Service, at any time and at our sole discretion — including where we
                        believe these Terms have been breached, where a chapter has been abandoned,
                        or where we receive a credible complaint from a named institution.
                    </p>
                    <p>
                        Any chapter will be removed on request from the creator, and any complaint
                        from a named institution will be answered promptly. Requests go to{' '}
                        <a href={`mailto:${contact}`} className="text-net">
                            {contact}
                        </a>
                        .
                    </p>
                    <p>
                        Sections 8 through 15 survive termination.
                    </p>
                </Section>

                <Section heading="12. Disclaimer of warranties">
                    <p className="uppercase">
                        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
                        available&rdquo;, without warranty of any kind, whether express, implied,
                        or statutory. To the fullest extent permitted by law we disclaim all
                        warranties, including the implied warranties of merchantability, fitness
                        for a particular purpose, title, and non-infringement.
                    </p>
                    <p>
                        We do not warrant that the Service will be uninterrupted, secure, or
                        error-free, or that any information on it — including reader counts and
                        officials&rsquo; contact details — is accurate, complete, or current.
                        Nothing on the Service is legal advice.
                    </p>
                </Section>

                <Section heading="13. Limitation of liability">
                    <p className="uppercase">
                        To the fullest extent permitted by law, in no event will {operator} or its
                        operators be liable for any indirect, incidental, special, consequential,
                        exemplary, or punitive damages, or for any loss of profits, data,
                        goodwill, or reputation, arising out of or relating to your use of the
                        Service, whether based in contract, tort, or any other theory, even if
                        advised of the possibility of such damages.
                    </p>
                    <p className="uppercase">
                        Our total aggregate liability arising out of or relating to the Service
                        will not exceed one hundred United States dollars (USD 100).
                    </p>
                    <p>
                        Some jurisdictions do not allow the exclusion of certain warranties or the
                        limitation of certain damages, so some of the above may not apply to you.
                        In that case our liability is limited to the greatest extent permitted by
                        law.
                    </p>
                </Section>

                <Section heading="14. Indemnification">
                    <p>
                        You agree to indemnify and hold harmless {operator} and its operators from
                        any claim, demand, loss, liability, or expense (including reasonable legal
                        fees) arising out of your content, your use of the Service, your breach of
                        these Terms, or your violation of any law or third-party right.
                    </p>
                </Section>

                <Section heading="15. Governing law and disputes">
                    <p>
                        These Terms are governed by the laws of {jurisdiction}, without regard to
                        its conflict of laws rules. You and we agree to the exclusive jurisdiction
                        of the courts located there, and each waives any objection to venue.
                    </p>
                    <p>
                        Before filing a claim, you agree to try to resolve the dispute informally by
                        contacting us and allowing thirty days to respond.
                    </p>
                </Section>

                <Section heading="16. Changes to these terms">
                    <p>
                        We may revise these Terms from time to time. The date at the top of this
                        page records the last material change. Continuing to use the Service after
                        a change takes effect means you accept the revised Terms; if you do not,
                        stop using the Service and ask us to remove your chapter.
                    </p>
                </Section>

                <Section heading="17. Miscellaneous">
                    <p>
                        These Terms, together with the{' '}
                        <Link href="/privacy" className="text-net">
                            Privacy Policy
                        </Link>
                        , are the entire agreement between you and us regarding the Service. If any
                        provision is held unenforceable, the rest remains in force. Our failure to
                        enforce a provision is not a waiver of it. You may not assign these Terms;
                        we may assign them to a successor operator of the Service.
                    </p>
                </Section>

                <Section heading="18. Contact">
                    <p>
                        Questions about these Terms, removal requests, and complaints go to{' '}
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
