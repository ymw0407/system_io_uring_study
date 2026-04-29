import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  maxWidth: vars.maxWidth.prose,
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: `2rem ${vars.space[6]} 0`,
  '@media': {
    '(max-width: 640px)': {
      padding: `1.5rem ${vars.space[4]} 0`,
      gap: '0.6rem',
    },
  },
});

export const navLink = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '0.7rem 1.2rem',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'inherit',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  minWidth: 0,
  selectors: {
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,51,102,0.06)',
      borderColor: '#c5d1e0',
      textDecoration: 'none',
    },
  },
  '@media': {
    '(max-width: 640px)': {
      padding: '0.6rem 0.9rem',
      flex: 1,
    },
  },
});

export const navDir = style({
  fontSize: '0.7rem',
  fontWeight: 600,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const navLabel = style({
  fontSize: '0.85rem',
  fontWeight: 500,
  color: vars.color.navy,
});

export const spacer = style({
  flex: 1,
});
