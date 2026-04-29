import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const nav = style({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  padding: '0.6rem 1.5rem',
  backgroundColor: 'rgba(247,249,252,0.95)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${vars.color.border}`,
  '@media': {
    '(max-width: 640px)': {
      flexWrap: 'wrap',
      padding: '0.5rem 1rem',
      gap: '0.4rem',
    },
  },
});

export const brand = style({
  fontSize: '0.88rem',
  fontWeight: 600,
  color: vars.color.navy,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  '@media': {
    '(max-width: 640px)': {
      fontSize: '0.8rem',
      flexBasis: '100%',
    },
  },
});

export const links = style({
  display: 'flex',
  gap: '0.3rem',
  alignItems: 'center',
  '@media': {
    '(max-width: 640px)': {
      flexWrap: 'wrap',
      gap: '0.2rem',
      width: '100%',
      justifyContent: 'flex-start',
    },
  },
});

export const link = style({
  fontSize: '0.82rem',
  fontWeight: 500,
  color: vars.color.textMuted,
  textDecoration: 'none',
  padding: '0.3rem 0.7rem',
  borderRadius: '6px',
  transition: 'color 0.15s, background-color 0.15s',
  whiteSpace: 'nowrap',
  selectors: {
    '&:hover': {
      color: vars.color.accentInterrupt,
      backgroundColor: '#eff6ff',
      textDecoration: 'none',
    },
  },
  '@media': {
    '(max-width: 640px)': {
      fontSize: '0.78rem',
      padding: '0.25rem 0.55rem',
    },
  },
});

export const activeLink = style({
  color: vars.color.accentInterrupt,
  backgroundColor: '#eff6ff',
});
