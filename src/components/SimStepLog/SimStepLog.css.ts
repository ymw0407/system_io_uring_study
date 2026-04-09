import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  backgroundColor: vars.color.terminalBg,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[4]}`,
  backgroundColor: vars.color.terminalHeader,
  fontSize: vars.fontSize.xs,
  color: vars.color.gray,
  fontFamily: vars.font.mono,
});

export const dot = style({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: vars.color.terminalMuted,
});

export const tableWrapper = style({
  overflowX: 'auto',
  padding: `${vars.space[3]} ${vars.space[4]}`,
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.xs,
  lineHeight: vars.lineHeight.normal,
});

export const th = style({
  textAlign: 'left',
  color: vars.color.terminalMuted,
  fontWeight: 600,
  paddingBottom: vars.space[2],
  paddingRight: vars.space[3],
  borderBottom: `1px solid ${vars.color.terminalMuted}`,
  whiteSpace: 'nowrap',
});

export const td = style({
  paddingTop: vars.space[1],
  paddingBottom: vars.space[1],
  paddingRight: vars.space[3],
  color: vars.color.terminalText,
  whiteSpace: 'nowrap',
});

export const rowDefault = style({});

export const rowSwitched = style({
  backgroundColor: 'rgba(251, 191, 36, 0.08)',
});

export const modePolling = style({
  color: vars.color.accentPolling,
  fontWeight: 600,
});

export const modeInterrupt = style({
  color: vars.color.accentInterrupt,
  fontWeight: 600,
});

export const reasonText = style({
  color: vars.color.terminalMuted,
  fontSize: vars.fontSize.xs,
});

export const empty = style({
  padding: vars.space[6],
  textAlign: 'center',
  color: vars.color.terminalMuted,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.sm,
});
