import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const figure = style({
  margin: `${vars.space[8]} 0`,
});

export const svg = style({
  display: 'block',
  width: '100%',
  maxWidth: '720px',
  height: 'auto',
  margin: '0 auto',
  fontFamily: vars.font.sans,
});

export const caption = style({
  marginTop: vars.space[3],
  marginInline: 'auto',
  maxWidth: '720px',
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  lineHeight: vars.lineHeight.relaxed,
});
