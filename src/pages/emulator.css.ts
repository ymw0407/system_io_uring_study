import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const page = style({
  maxWidth: '1000px',
  margin: '0 auto',
  padding: `${vars.space[10]} ${vars.space[6]} ${vars.space[16]}`,
  '@media': {
    '(max-width: 640px)': {
      padding: `${vars.space[6]} ${vars.space[4]} ${vars.space[10]}`,
    },
  },
});

export const header = style({
  marginBottom: vars.space[8],
  '@media': {
    '(max-width: 640px)': {
      marginBottom: vars.space[5],
    },
  },
});

export const title = style({
  fontSize: vars.fontSize['3xl'],
  fontWeight: 700,
  color: vars.color.navy,
  marginBottom: vars.space[2],
  '@media': {
    '(max-width: 640px)': {
      fontSize: vars.fontSize['2xl'],
    },
  },
});

export const subtitle = style({
  fontSize: vars.fontSize.base,
  color: vars.color.textMuted,
  lineHeight: vars.lineHeight.normal,
});

export const section = style({
  marginBottom: vars.space[8],
});
