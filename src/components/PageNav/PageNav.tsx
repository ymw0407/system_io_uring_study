import { Link } from 'react-router-dom';
import * as s from './PageNav.css';

interface NavTarget {
  to: string;
  label: string;
}

interface PageNavProps {
  prev?: NavTarget;
  next?: NavTarget;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className={s.wrapper}>
      {prev ? (
        <Link to={prev.to} className={s.navLink}>
          <span className={s.navDir}>Previous</span>
          <span className={s.navLabel}>{prev.label}</span>
        </Link>
      ) : (
        <div className={s.spacer} />
      )}
      {next ? (
        <Link to={next.to} className={s.navLink} style={{ textAlign: 'right' }}>
          <span className={s.navDir}>Next</span>
          <span className={s.navLabel}>{next.label}</span>
        </Link>
      ) : (
        <div className={s.spacer} />
      )}
    </div>
  );
}
