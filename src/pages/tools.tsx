import { Link } from 'react-router-dom';
import * as s from './tools.css';

const comparisonRows = [
  {
    aspect: '핵심 목적',
    simulator: '정책의 추적 능력 검증',
    emulator: '피드백 루프 효과 검증',
  },
  {
    aspect: '피드백',
    simulator: '없음 (고정 트레이스)',
    emulator: '있음 (모드 선택이 CPU/latency에 영향)',
  },
  {
    aspect: '용도',
    simulator: '파라미터 튜닝',
    emulator: '실제 동작 예측',
  },
];

export default function Tools() {
  return (
    <div className={s.page}>
      <header className={s.hero}>
        <h1 className={s.heroTitle}>Adaptive I/O Tools</h1>
        <p className={s.heroSubtitle}>
          io_uring adaptive 정책을 시뮬레이션하고 에뮬레이션하는 두 가지 도구를 제공한다.
          피드백 유무에 따라 정책의 동작이 어떻게 달라지는지 직접 비교할 수 있다.
        </p>
      </header>

      <div className={s.content}>
        <h2 className={s.sectionTitle}>Simulator vs Emulator</h2>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>측면</th>
                <th className={s.th}>Simulator</th>
                <th className={s.th}>Emulator</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.aspect}>
                  <td className={s.td}>{row.aspect}</td>
                  <td className={s.td}>{row.simulator}</td>
                  <td className={s.td}>{row.emulator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={s.cardGrid}>
          <Link to="/simulator" className={s.card}>
            <div className={s.cardTitle}>Simulator</div>
            <div className={s.cardDesc}>
              피드백 없이 고정 트레이스에서 정책의 모드 결정을 관찰한다
            </div>
            <div className={s.cardArrow}>바로가기 →</div>
          </Link>

          <Link to="/emulator" className={s.card}>
            <div className={s.cardTitle}>Emulator</div>
            <div className={s.cardDesc}>
              피드백 루프 포함. 모드 선택이 CPU 사용률과 latency에 영향을 미친다
            </div>
            <div className={s.cardArrow}>바로가기 →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
