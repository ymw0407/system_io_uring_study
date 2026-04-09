import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const layout = style({
  minHeight: '100vh',
  backgroundColor: vars.color.bg,
});

export const main = style({
  paddingBottom: vars.space[12],
});
