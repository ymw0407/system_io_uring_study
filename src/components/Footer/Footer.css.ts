import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const footer = style({
  textAlign: 'center',
  color: vars.color.textMuted,
  fontSize: '0.8rem',
  padding: `${vars.space[8]} 0`,
  borderTop: `1px solid ${vars.color.border}`,
  maxWidth: vars.maxWidth.prose,
  marginLeft: 'auto',
  marginRight: 'auto',
});
