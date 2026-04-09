import * as s from './Terminal.css';

interface TerminalProps {
  title?: string;
  commands: Array<{
    cmd: string;
    output?: string[];
  }>;
}

export function Terminal({ title, commands }: TerminalProps) {
  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <span className={s.dot} />
        <span className={s.dot} />
        <span className={s.dot} />
        <span>{title ?? 'Terminal'}</span>
      </div>
      <div className={s.body}>
        {commands.map((entry, i) => (
          <div key={i}>
            <div className={s.commandLine}>{entry.cmd}</div>
            {entry.output?.map((line, j) => (
              <div key={j} className={s.outputLine}>{line}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
