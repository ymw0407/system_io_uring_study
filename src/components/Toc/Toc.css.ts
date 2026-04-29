import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const nav = style({
  maxWidth: vars.maxWidth.prose,
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: `1rem ${vars.space[6]} 0`,
  '@media': {
    '(max-width: 640px)': {
      padding: `0.75rem ${vars.space[4]} 0`,
    },
  },
});

export const list = style({
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '1.2rem 1.5rem',
  backgroundColor: vars.color.surface,
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  '@media': {
    '(max-width: 640px)': {
      padding: '1rem 1rem',
    },
  },
});

export const item = style({
  fontSize: '0.85rem',
  color: vars.color.textMuted,
  transition: 'color 0.15s',
  selectors: {
    '&:hover': {
      color: vars.color.accentInterrupt,
    },
  },
});

export const link = style({
  color: vars.color.accentInterrupt,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

export const tocTitle = style({
  fontSize: '0.78rem',
  fontWeight: 600,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
  paddingLeft: '1.5rem',
  '@media': {
    '(max-width: 640px)': {
      paddingLeft: '1rem',
    },
  },
});
