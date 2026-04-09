import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const section = style({
  maxWidth: vars.maxWidth.prose,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: '1.5rem',
  paddingLeft: vars.space[6],
  paddingRight: vars.space[6],
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  padding: '1.5rem 2rem',
});

export const sectionTitle = style({
  fontSize: '1.3rem',
  fontWeight: 700,
  color: vars.color.navy,
  marginBottom: '0.8rem',
  paddingBottom: '0.5rem',
  borderBottom: `2px solid ${vars.color.badge}`,
});

export const sectionBody = style({
  fontSize: '0.92rem',
  lineHeight: '1.7',
  color: vars.color.text,
});
