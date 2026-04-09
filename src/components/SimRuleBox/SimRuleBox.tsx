import { useMemo } from 'react';
import type { SimStep } from '../../simulation/types';
import * as s from './SimRuleBox.css';

interface SimRuleBoxProps {
  steps: SimStep[];
  position: number;
}

interface RuleCounts {
  interruptByCpu: number;
  pollingByQd: number;
  cooldownHold: number;
}

function countRules(steps: SimStep[], upTo: number): RuleCounts {
  const visible = steps.slice(0, upTo);
  const counts: RuleCounts = {
    interruptByCpu: 0,
    pollingByQd: 0,
    cooldownHold: 0,
  };

  for (const step of visible) {
    const reason = step.reason.toLowerCase();
    if (reason.includes('cpu') && step.mode === 'interrupt') {
      counts.interruptByCpu++;
    } else if (
      (reason.includes('qd') || reason.includes('queue')) &&
      step.mode === 'polling'
    ) {
      counts.pollingByQd++;
    } else if (reason.includes('cooldown') || reason.includes('hold')) {
      counts.cooldownHold++;
    }
  }

  return counts;
}

function getActiveRule(
  steps: SimStep[],
  position: number,
): 'interrupt' | 'polling' | 'cooldown' | null {
  if (position <= 0 || steps.length === 0) return null;
  const idx = Math.min(position - 1, steps.length - 1);
  const step = steps[idx];
  if (!step) return null;

  const reason = step.reason.toLowerCase();
  if (reason.includes('cooldown') || reason.includes('hold')) return 'cooldown';
  if (step.mode === 'interrupt') return 'interrupt';
  if (step.mode === 'polling') return 'polling';
  return null;
}

export function SimRuleBox({ steps, position }: SimRuleBoxProps) {
  const counts = useMemo(() => countRules(steps, position), [steps, position]);
  const active = useMemo(() => getActiveRule(steps, position), [steps, position]);

  return (
    <div className={s.grid}>
      {/* Rule 1: CPU overload triggers interrupt */}
      <div
        className={
          active === 'interrupt' ? s.ruleCardInterrupt : s.ruleCard
        }
      >
        <div className={s.ruleTitle}>CPU Overload</div>
        <div className={s.ruleCondition}>
          CPU {'>'} threshold → INTERRUPT
        </div>
        <span className={s.triggerCountInterrupt}>{counts.interruptByCpu}</span>
        <span className={s.triggerLabel}>triggers</span>
      </div>

      {/* Rule 2: High QD with headroom triggers polling */}
      <div
        className={
          active === 'polling' ? s.ruleCardPolling : s.ruleCard
        }
      >
        <div className={s.ruleTitle}>QD High + CPU OK</div>
        <div className={s.ruleCondition}>
          {'QD >= threshold & CPU ok → POLLING'}
        </div>
        <span className={s.triggerCountPolling}>{counts.pollingByQd}</span>
        <span className={s.triggerLabel}>triggers</span>
      </div>

      {/* Rule 3: Cooldown hold */}
      <div
        className={
          active === 'cooldown' ? s.ruleCardCooldown : s.ruleCard
        }
      >
        <div className={s.ruleTitle}>Cooldown Active</div>
        <div className={s.ruleCondition}>
          Cooldown active → HOLD mode
        </div>
        <span className={s.triggerCountCooldown}>{counts.cooldownHold}</span>
        <span className={s.triggerLabel}>triggers</span>
      </div>
    </div>
  );
}
