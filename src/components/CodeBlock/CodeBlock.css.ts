import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  position: 'relative',
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
  paddingRight: '3rem',
  backgroundColor: '#334155',
  fontSize: '0.72rem',
  color: '#94a3b8',
  fontFamily: vars.font.mono,
});

export const copyButton = style({
  position: 'absolute',
  top: '0.4rem',
  right: '0.4rem',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.3rem',
  padding: '0.3rem 0.55rem',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '4px',
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  color: '#cbd5e1',
  fontSize: '0.7rem',
  fontFamily: vars.font.mono,
  cursor: 'pointer',
  opacity: 0.6,
  transition: 'opacity 0.15s, background-color 0.15s, color 0.15s',
  selectors: {
    [`${wrapper}:hover &`]: {
      opacity: 1,
    },
    '&:hover': {
      backgroundColor: 'rgba(30, 41, 59, 0.9)',
      color: '#f1f5f9',
      opacity: 1,
    },
    '&:focus-visible': {
      opacity: 1,
      outline: `2px solid ${vars.color.accentInterrupt}`,
      outlineOffset: '1px',
    },
  },
  '@media': {
    '(max-width: 640px)': {
      opacity: 0.85,
      padding: '0.25rem 0.45rem',
      fontSize: '0.65rem',
    },
  },
});

export const copyButtonCopied = style({
  color: vars.color.accentPolling,
  borderColor: 'rgba(110, 231, 183, 0.4)',
  opacity: 1,
});

export const copyIcon = style({
  width: '12px',
  height: '12px',
  flexShrink: 0,
});

export const pre = style({
  margin: 0,
  padding: '1rem 1.2rem',
  backgroundColor: '#1e293b',
  overflow: 'auto',
  fontSize: '0.82rem',
  lineHeight: '1.6',
  fontFamily: vars.font.mono,
  WebkitOverflowScrolling: 'touch',
  '@media': {
    '(max-width: 640px)': {
      padding: '0.8rem 0.9rem',
      fontSize: '0.75rem',
    },
  },
});

export const code = style({
  fontFamily: vars.font.mono,
  fontSize: 'inherit',
  color: '#e2e8f0',
  backgroundColor: 'transparent',
  padding: 0,
  borderRadius: 0,
});
