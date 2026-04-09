import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const bar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[3],
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: `${vars.space[3]} ${vars.space[4]}`,
});

export const playButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  color: vars.color.navy,
  cursor: 'pointer',
  flexShrink: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: 700,
  transition: 'background-color 0.15s',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceAlt,
    },
  },
});

export const slider = style({
  flex: 1,
  accentColor: vars.color.navy,
  cursor: 'pointer',
  minWidth: 0,
});

export const positionLabel = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.mono,
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  minWidth: '80px',
  textAlign: 'right',
});
