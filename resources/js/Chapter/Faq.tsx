import { useState } from 'react';
import { FAQ } from '@/Chapter/content';
import Section from '@/Chapter/Section';

/**
 * Built on <details> rather than state.
 *
 * Every answer is in the document at first paint and stays readable if no
 * script ever runs, which is the standing rule on this project. It also gets
 * keyboard behaviour and find-in-page for free.
 *
 * The whole card opens it, not just the words. The padding sits on the summary
 * so there is no ring of dead space around a row that plainly looks pressable.
 */
export default function Faq() {
    return (
        <Section id="faq" label="">
            <h2
                style={{
                    fontFamily: 'var(--display)',
                    fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    margin: '0 0 1.8rem',
                }}
            >
                FAQ
            </h2>

            <div style={{ display: 'grid', gap: '0.6rem' }}>
                {FAQ.map((item) => (
                    <Item key={item.question} question={item.question} answer={item.answer} />
                ))}
            </div>
        </Section>
    );
}

function Item({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <details
            className="cfaq"
            /*
             * The marker's angle is React's, not the stylesheet's. A [open]
             * selector for it kept losing to the cascade once Tailwind's layers
             * were in play, and an inline transform cannot be outranked. The
             * element is still a real <details>: this only decorates it, and it
             * opens and closes correctly with the script removed.
             */
            onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
        >
            <summary>
                <span>{question}</span>
                <span
                    className="cfaq-mark"
                    aria-hidden="true"
                    style={{ transform: `rotate(${open ? 225 : 45}deg)` }}
                />
            </summary>
            <p className="cfaq-answer">{answer}</p>
        </details>
    );
}
