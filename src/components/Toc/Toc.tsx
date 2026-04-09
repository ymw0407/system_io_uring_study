import * as s from './Toc.css';

interface TocEntry {
  id: string;
  label: string;
}

const entries: TocEntry[] = [
  { id: 'motivation', label: 'Problem Motivation' },
  { id: 'background', label: 'Background: io_uring' },
  { id: 'steps', label: 'Study Steps (3 Rounds)' },
  { id: 'experiment', label: 'Experiment' },
  { id: 'result', label: 'Result & Insight' },
  { id: 'conclusion', label: 'Conclusion' },
];

export function Toc() {
  return (
    <nav className={s.nav}>
      <div className={s.tocTitle}>Table of Contents</div>
      <ol className={s.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={s.item}>
            <a className={s.link} href={`#${entry.id}`}>
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
