import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  marginTop: '0.8rem',
  marginBottom: '0.8rem',
  borderRadius: '6px',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.35rem 1rem',
  backgroundColor: '#334155',
  fontSize: '0.72rem',
  color: '#94a3b8',
  fontFamily: vars.font.mono,
});

export const pre = style({
  margin: 0,
  padding: '1rem 1.2rem',
  backgroundColor: '#1e293b',
  overflow: 'auto',
  fontSize: '0.82rem',
  lineHeight: '1.6',
  fontFamily: vars.font.mono,
});

export const code = style({
  fontFamily: vars.font.mono,
  fontSize: 'inherit',
  color: '#e2e8f0',
  backgroundColor: 'transparent',
  padding: 0,
  borderRadius: 0,
});
