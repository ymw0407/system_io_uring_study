import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gap: vars.space[4],
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    '(max-width: 480px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: `${vars.space[4]} ${vars.space[5]}`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[1],
});

export const label = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

export const value = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.text,
  lineHeight: vars.lineHeight.tight,
});

export const valueAdaptive = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.accentAdaptive,
  lineHeight: vars.lineHeight.tight,
});

export const valueInterrupt = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.accentInterrupt,
  lineHeight: vars.lineHeight.tight,
});

export const valuePolling = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.accentPolling,
  lineHeight: vars.lineHeight.tight,
});

export const unit = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 400,
  color: vars.color.textMuted,
  marginLeft: vars.space[1],
});

export const placeholder = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.textMuted,
  lineHeight: vars.lineHeight.tight,
});
