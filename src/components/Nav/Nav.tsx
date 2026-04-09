import { Link, useLocation } from 'react-router-dom';
import * as s from './Nav.css';

const routes = [
  { to: '/round1', label: 'Round 1' },
  { to: '/round2', label: 'Round 2' },
  { to: '/round3', label: 'Round 3' },
  { to: '/tools', label: 'Tools' },
];

export function Nav() {
  const location = useLocation();

  return (
    <nav className={s.nav}>
      <Link to="/" className={s.brand}>
        io_uring Adaptive I/O
      </Link>
      <div className={s.links}>
        {routes.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className={`${s.link} ${location.pathname === r.to ? s.activeLink : ''}`}
          >
            {r.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
