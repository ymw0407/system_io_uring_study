import { Link, useLocation } from 'react-router-dom';
import * as s from './Nav.css';

const routes = [
  { to: '/part1', label: 'Part 1' },
  { to: '/part2', label: 'Part 2' },
  { to: '/part3', label: 'Part 3' },
  { to: '/part4', label: 'Part 4' },
  { to: '/setup', label: 'Setup' },
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
