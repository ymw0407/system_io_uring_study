import type { ReactNode } from 'react';
import * as s from './Steps.css';

interface StepProps {
  title: string;
  children: ReactNode;
}

interface StepsProps {
  children: ReactNode;
}

export function Steps({ children }: StepsProps) {
  return <div className={s.stepsWrapper}>{children}</div>;
}

export function Step({ title, children }: StepProps) {
  return (
    <div className={s.step}>
      <div className={s.stepContent}>
        <div className={s.stepTitle}>{title}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
