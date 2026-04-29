import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  maxWidth: vars.maxWidth.prose,
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: `${vars.space[8]} ${vars.space[6]}`,
  '@media': {
    '(max-width: 640px)': {
      padding: `${vars.space[6]} ${vars.space[4]}`,
    },
  },
});

export const heading = style({
  fontSize: '1.2rem',
  fontWeight: 700,
  color: vars.color.navy,
  marginBottom: vars.space[6],
});

export const stepList = style({
  position: 'relative',
});
