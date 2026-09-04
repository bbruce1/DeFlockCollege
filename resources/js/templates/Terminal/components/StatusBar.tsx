interface Props {
    host: string;
    /** The frame this session is looking at, straight from the map build. */
    bbox: string;
    generatedAt: string;
}

/** Window chrome: which tty, which frame, when it was last read. */
export default function StatusBar({ host, bbox, generatedAt }: Props) {
    return (
        <header className="tt__bar">
            <span>tty1</span>
            <span>{host}</span>
            <span className="tt__bar-spacer" />
            <span>frame {bbox || 'unset'}</span>
            <span>read {generatedAt || 'unknown'}</span>
            <span className="tt__live">session live</span>
        </header>
    );
}
