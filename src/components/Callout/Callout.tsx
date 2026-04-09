import type { ReactNode } from 'react';
import * as s from './Callout.css';

type CalloutKind = 'note' | 'warn' | 'tip' | 'checkpoint';

interface CalloutProps {
  kind?: CalloutKind;
  children: ReactNode;
}

const TITLES: Record<CalloutKind, string> = {
  note: 'Note',
  warn: 'Warning',
  tip: 'Tip',
  checkpoint: 'Checkpoint',
};

export function Callout({ kind = 'note', children }: CalloutProps) {
  return (
    <aside className={s.callout({ kind })}>
      <div className={s.calloutTitle({ kind })}>{TITLES[kind]}</div>
      <div>{children}</div>
    </aside>
  );
}
