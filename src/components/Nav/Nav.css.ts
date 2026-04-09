import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const nav = style({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.6rem 1.5rem',
  backgroundColor: 'rgba(247,249,252,0.95)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const brand = style({
  fontSize: '0.88rem',
  fontWeight: 600,
  color: vars.color.navy,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
});

export const links = style({
  display: 'flex',
  gap: '0.3rem',
  alignItems: 'center',
});

export const link = style({
  fontSize: '0.82rem',
  fontWeight: 500,
  color: vars.color.textMuted,
  textDecoration: 'none',
  padding: '0.3rem 0.7rem',
  borderRadius: '6px',
  transition: 'color 0.15s, background-color 0.15s',
  selectors: {
    '&:hover': {
      color: vars.color.accentInterrupt,
      backgroundColor: '#eff6ff',
      textDecoration: 'none',
    },
  },
});

export const activeLink = style({
  color: vars.color.accentInterrupt,
  backgroundColor: '#eff6ff',
});
