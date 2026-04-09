import * as s from './Hero.css';

export function Hero() {
  return (
    <header className={s.hero}>
      <h1 className={s.title}>io_uring Adaptive I/O Strategy</h1>
      <p className={s.subtitle}>
        Baseline → Interrupt → Polling → Adaptive 순서로 진행하는
        학부 시스템 연구 실습 기록
      </p>
      <div className={s.meta}>
        <span className={s.badge}>2026-1 System Study</span>
        <span className={s.tag}>io_uring</span>
        <span className={s.tag}>liburing</span>
        <span className={s.tag}>SQPOLL</span>
        <span className={s.tag}>Linux 6.x</span>
      </div>
    </header>
  );
}
