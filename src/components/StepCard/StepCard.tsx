import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import * as s from './StepCard.css';

interface StepCardProps {
  step: number;
  kind?: 'setup' | 'lab' | 'default';
  label?: string;
  title: string;
  description: string;
  tools?: string[];
  href?: string;
  isLast?: boolean;
  children?: ReactNode;
}

export function StepCard({
  step,
  kind = 'default',
  label,
  title,
  description,
  tools,
  href,
  isLast = false,
  children,
}: StepCardProps) {
  const cardContent = (
    <>
      {label && <div className={s.cardLabel({ kind })}>{label}</div>}
      <div className={s.cardTitle}>{title}</div>
      <div className={s.cardDesc}>{description}</div>
      {tools && tools.length > 0 && (
        <div className={s.toolBadges}>
          {tools.map((t) => (
            <span key={t} className={s.toolBadge}>{t}</span>
          ))}
        </div>
      )}
      {children}
    </>
  );

  return (
    <div className={s.stepItem}>
      <div className={s.stepNumberCol}>
        <div className={s.stepBadge({ kind })}>{step}</div>
        {!isLast && <div className={s.connector} />}
      </div>
      {href ? (
        <Link to={href} className={s.cardLink}>
          <div className={s.card}>{cardContent}</div>
        </Link>
      ) : (
        <div className={s.card}>{cardContent}</div>
      )}
    </div>
  );
}
