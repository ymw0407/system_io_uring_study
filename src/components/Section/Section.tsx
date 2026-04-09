import type { ReactNode } from 'react';
import * as s from './Section.css';

interface SectionProps {
  title: string;
  id: string;
  children: ReactNode;
}

export function Section({ title, id, children }: SectionProps) {
  return (
    <section className={s.section} id={id}>
      <div className={s.card}>
        <h2 className={s.sectionTitle}>{title}</h2>
        <div className={s.sectionBody}>{children}</div>
      </div>
    </section>
  );
}
