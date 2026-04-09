import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  marginTop: '1rem',
  marginBottom: '1rem',
  padding: '1.2rem 1.5rem',
  backgroundColor: vars.color.surface,
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
});

export const caption = style({
  marginTop: '0.5rem',
  fontSize: '0.78rem',
  color: vars.color.textMuted,
  textAlign: 'center',
  fontStyle: 'italic',
});
