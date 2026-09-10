import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import Prose, { Section } from '@/Pages/Legal/Prose';

interface Props {
    email: string;
}

// Deliberately no person named here. The address is the contact; who reads it
// is not the reader's business and is nobody's to publish but theirs.
export default function Contact({ email }: Props) {
    return (
        <Shell>
            <Head title="Contact" />

            <Prose
                title="Contact"
                standfirst="One address, read by one person. There is no ticket queue behind it and no form to fill in."
            >
                <Section heading="Email">
                    <p>Write to:</p>

                    <p>
                        <a
                            href={`mailto:${email}`}
                            className="font-data text-lg text-net underline decoration-hair-lit underline-offset-4 hover:text-glow"
                        >
                            {email}
                        </a>
                    </p>
                </Section>

                <Section heading="What to write about">
                    <p>
                        <b>A chapter that has been abandoned</b>, or one with something wrong on it. A
                        school name or an office that is wrong in the shipped data. A chapter page
                        that should be taken down, whether you started it or you are the school it
                        names.
                    </p>
                    <p>
                        Lost your edit key? Go to your
                        chapter page and use the edit link at the bottom, which will send a new key
                        to the school address the chapter was made with.
                    </p>
                </Section>

                <Section heading="What this is not">
                    <p>
                        Not a way to reach a chapter. Chapters are run by students who are not
                        reachable here.
                    </p>
                </Section>
            </Prose>
        </Shell>
    );
}
