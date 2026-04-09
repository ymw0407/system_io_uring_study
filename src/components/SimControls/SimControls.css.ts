import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space[6],
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space[6],
  '@media': {
    '(max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const column = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[1],
});

export const labelRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const label = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
});

export const valueDisplay = style({
  fontSize: vars.fontSize.sm,
  fontFamily: vars.font.mono,
  color: vars.color.navy,
  fontWeight: 600,
});

export const slider = style({
  width: '100%',
  accentColor: vars.color.navy,
  cursor: 'pointer',
});

export const select = style({
  width: '100%',
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  fontFamily: vars.font.sans,
  fontSize: vars.fontSize.sm,
  color: vars.color.text,
  cursor: 'pointer',
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.navy,
    },
  },
});

export const numberInput = style({
  width: '100%',
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.sm,
  color: vars.color.text,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.navy,
    },
  },
});

export const actions = style({
  display: 'flex',
  gap: vars.space[3],
  marginTop: vars.space[5],
  paddingTop: vars.space[5],
  borderTop: `1px solid ${vars.color.border}`,
});

export const runButton = style({
  padding: `${vars.space[2]} ${vars.space[6]}`,
  borderRadius: vars.radius.sm,
  border: 'none',
  backgroundColor: vars.color.navy,
  color: vars.color.surface,
  fontFamily: vars.font.sans,
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  selectors: {
    '&:hover': {
      opacity: '0.9',
    },
  },
});

export const resetButton = style({
  padding: `${vars.space[2]} ${vars.space[6]}`,
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: 'transparent',
  color: vars.color.text,
  fontFamily: vars.font.sans,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.surfaceAlt,
    },
  },
});
