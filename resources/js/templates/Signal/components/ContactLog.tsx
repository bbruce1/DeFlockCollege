import { compassPoint, padBearing, type Contact } from '../geometry';

/**
 * The same returns as the scope, in the form an operator would actually log them.
 *
 * It exists because a plot can be argued with and a list cannot: every bearing,
 * range and heading is text in the DOM, countable and quotable.
 */
export default function ContactLog({ contacts }: { contacts: Contact[] }) {
    if (contacts.length === 0) {
        return null;
    }

    return (
        <div className="sig-log">
            <table className="sig-table">
                <caption className="sig-mono" style={{ textAlign: 'left', padding: '0 0.6rem 0.5rem' }}>
                    Contact log — {contacts.length} returns
                </caption>
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Brg</th>
                        <th scope="col">Rng</th>
                        <th scope="col">Faces</th>
                        <th scope="col">Vendor</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.map((contact) => (
                        <tr key={contact.index}>
                            <td>{String(contact.index + 1).padStart(3, '0')}</td>
                            <td>
                                {padBearing(contact.bearing)}° {compassPoint(contact.bearing)}
                            </td>
                            <td>{contact.range.toFixed(2)}</td>
                            <td>{contact.heading >= 0 ? `${padBearing(contact.heading)}°` : '—'}</td>
                            <td className={contact.isFlock ? 'sig-tag-flock' : 'sig-tag-other'}>
                                {contact.isFlock ? 'FLOCK' : 'UNSPEC'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
