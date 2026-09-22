import Section from '@/Chapter/Section';

export interface Meeting {
    date: string;
    time: string | null;
    place: string;
    note: string;
}

/**
 * When this chapter actually meets.
 *
 * Only rendered when there is something upcoming: an events section listing
 * nothing reads as a chapter that has stopped, which is worse than a page that
 * never claimed to hold meetings at all.
 *
 * Past meetings are filtered on the server, so this is right before any script
 * runs and cannot be left showing last month by a failed effect.
 */
export default function Meetings({ meetings }: { meetings: Meeting[] }) {
    if (meetings.length === 0) {
        return null;
    }

    return (
        <Section id="meetings" label="Come along">
            <h2
                style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    margin: '0 0 1.8rem',
                }}
            >
                {meetings.length === 1 ? 'The next meeting' : 'Upcoming meetings'}
            </h2>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.8rem' }}>
                {meetings.map((meeting) => (
                    <li
                        key={`${meeting.date}-${meeting.time ?? ''}-${meeting.place}`}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'baseline',
                            gap: '0.5rem 1.4rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            borderLeft: '3px solid var(--accent)',
                            borderRadius: 'var(--radius)',
                            padding: '1.1rem 1.3rem',
                        }}
                    >
                        <time
                            dateTime={meeting.time ? `${meeting.date}T${meeting.time}` : meeting.date}
                            style={{
                                fontFamily: 'var(--data)',
                                fontSize: '1.02rem',
                                fontWeight: 700,
                                color: 'var(--accent)',
                            }}
                        >
                            {formatDate(meeting.date)}
                            {meeting.time ? ` · ${formatTime(meeting.time)}` : ''}
                        </time>

                        {meeting.place ? (
                            <span style={{ fontWeight: 700, fontFamily: 'var(--display)' }}>
                                {meeting.place}
                            </span>
                        ) : null}

                        {meeting.note ? (
                            <span
                                style={{
                                    color: 'var(--ink-soft)',
                                    fontSize: '0.92rem',
                                    flexBasis: '100%',
                                    lineHeight: 1.55,
                                }}
                            >
                                {meeting.note}
                            </span>
                        ) : null}
                    </li>
                ))}
            </ul>

            <p
                style={{
                    marginTop: '1.2rem',
                    fontSize: '0.85rem',
                    color: 'var(--ink-soft)',
                    lineHeight: 1.6,
                }}
            >
                Anyone can come. You do not have to have done anything first, and you do not
                have to speak.
            </p>
        </Section>
    );
}

/** Parsed as a plain date so it never shifts a day across time zones. */
function formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);

    return parsed.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const parsed = new Date(2000, 0, 1, hours, minutes);

    return parsed.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
