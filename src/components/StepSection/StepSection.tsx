import type { ReactNode } from 'react';
import * as s from './StepSection.css';

interface StepSectionProps {
  title: string;
  id: string;
  children: ReactNode;
}

export function StepSection({ title, id, children }: StepSectionProps) {
  return (
    <div className={s.wrapper} id={id}>
      <h2 className={s.heading}>{title}</h2>
      <div className={s.stepList}>{children}</div>
    </div>
  );
}
