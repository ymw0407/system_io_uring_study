import * as s from './SimPlayback.css';

interface SimPlaybackProps {
  total: number;
  position: number;
  onPositionChange: (pos: number) => void;
  playing: boolean;
  onPlayToggle: () => void;
}

export function SimPlayback({
  total,
  position,
  onPositionChange,
  playing,
  onPlayToggle,
}: SimPlaybackProps) {
  const windowSize = 200;
  const windowStart = Math.max(0, position - windowSize);

  return (
    <div className={s.bar}>
      <button
        className={s.playButton}
        onClick={onPlayToggle}
        type="button"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '||' : '\u25B6'}
      </button>
      <input
        className={s.slider}
        type="range"
        min={0}
        max={total}
        step={1}
        value={position}
        onChange={(e) => onPositionChange(Number(e.target.value))}
      />
      <span className={s.positionLabel}>
        {windowStart}..{position} / {total}
      </span>
    </div>
  );
}
