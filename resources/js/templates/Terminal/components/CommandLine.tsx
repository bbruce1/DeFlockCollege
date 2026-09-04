import Cursor from './Cursor';

interface Props {
    /** The invocation, printed after the prompt. */
    command: string;
    host: string;
    cwd?: string;
    /** Only the live line at the very bottom of a session carries a cursor. */
    cursor?: boolean;
}

/** The prompt line every block of output hangs from. */
export default function CommandLine({ command, host, cwd = '~', cursor = false }: Props) {
    return (
        <p className="tt__cmd">
            <span className="tt__cmd-user">students@{host}</span>
            <span>:{cwd}$ </span>
            <em>{command}</em>
            {cursor ? <> <Cursor /></> : null}
        </p>
    );
}
