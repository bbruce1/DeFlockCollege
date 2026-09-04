import type { ChapterMap } from '../../contract';

interface Props {
    map: ChapterMap;
    schoolName: string;
}

/** Provenance, because every number on this page is meant to be checkable. */
export default function SignOff({ map, schoolName }: Props) {
    return (
        <footer className="tt__foot">
            <p>
                source: OpenStreetMap contributors, ODbL &middot; frame {map.bbox || 'unset'} &middot; built{' '}
                {map.generatedAt || 'unknown'}
            </p>
            <p>
                A student chapter concerning {schoolName}. Not run by the school, and not run by DeFlock.
            </p>
            <p aria-hidden="true">[EOF]</p>
        </footer>
    );
}
