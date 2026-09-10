import { Head, Link } from '@inertiajs/react';
import Shell from '@/Layouts/Shell';
import Prose, { Section } from '@/Pages/Legal/Prose';

export default function About() {
    return (
        <Shell>
            <Head title="About DeFlock Campus" />

            <Prose
                title="About"
                standfirst="Starting a campus chapter against automated plate readers should cost one student and twenty minutes, and it should cost exactly that at the two hundredth school as it did at the first."
            >
                <Section heading="What this is">
                    <p>
                        Automated license plate readers photograph every vehicle that passes them
                        and keep that record whether or not anyone is suspected of anything. They
                        are appearing around campuses through council votes, university contracts,
                        and police purchase orders — decisions made quickly, and reversible by the
                        same people who made them.
                    </p>
                    <p>
                        This builds a chapter page for a campus from public map data, and puts a
                        written letter to the offices that can remove them one click away.
                    </p>
                </Section>

                <Section heading="The ask">
                    <p>
                        <strong className="text-glow">
                            Removal of the readers, and a ban on new installations.
                        </strong>{' '}
                        Not audits, not retention limits, not transparency reports. Through
                        elected officials and votes, never vandalism.
                    </p>
                </Section>

                <Section heading="How a chapter is made">
                    <p>
                        A student verifies a school email, names the campus, and picks its
                        location. Every reader mapped within a mile is counted from
                        OpenStreetMap, along with the total for the state, and a page is built
                        from those numbers. The creator attaches an Instagram, and can add the
                        officials worth writing to.
                    </p>
                    <p>
                        Nothing routes through us. There is no approval queue, no intake call, and
                        no form a human here has to read.
                    </p>
                </Section>

                <Section heading="Where the numbers come from">
                    <p>
                        Every count on a chapter page comes from{' '}
                        <a
                            href="https://www.openstreetmap.org/copyright"
                            target="_blank"
                            rel="noopener"
                            className="text-net underline decoration-hair-lit underline-offset-2"
                        >
                            OpenStreetMap
                        </a>
                        , where readers are mapped by volunteers. That makes every figure
                        checkable by anyone, and it makes each one a floor rather than a census:
                        there are almost certainly readers nobody has mapped yet.
                    </p>
                    <p>
                        A campus with nothing mapped gets a page that says so. We do not estimate,
                        round up, or assert a ring of cameras that is not in the data.
                    </p>
                </Section>

                <Section heading="What this deliberately does not have">
                    <p>
                        No accounts, no passwords to lose, no messaging, no comments, and no
                        forums. A communication surface is a moderation obligation, and moderation
                        does not scale to hundreds of campuses run by nobody. A chapter's
                        Instagram is its only channel.
                    </p>
                </Section>

                <Section heading="Chapters are run by students">
                    <p>
                        A chapter is not affiliated with, endorsed by, or operated by the school
                        it is named for. Naming a school identifies which campus a chapter is
                        about — nothing more. See the{' '}
                        <Link href="/terms" className="text-net underline decoration-hair-lit underline-offset-2">
                            terms
                        </Link>{' '}
                        for how a chapter is removed.
                    </p>
                </Section>
            </Prose>
        </Shell>
    );
}
