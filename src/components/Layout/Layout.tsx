import { Outlet } from 'react-router-dom';
import { Nav } from '../Nav/Nav';
import { Footer } from '../Footer/Footer';
import * as s from './Layout.css';

export function Layout() {
  return (
    <div className={s.layout}>
      <Nav />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
