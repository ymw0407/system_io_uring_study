import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  marginTop: '0.6rem',
  marginBottom: '0.6rem',
  borderRadius: '6px',
  overflow: 'hidden',
  border: `1px solid ${vars.color.border}`,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0.3rem 0.8rem',
  backgroundColor: '#334155',
  fontSize: '0.68rem',
  color: '#94a3b8',
  fontFamily: vars.font.mono,
});

export const dot = style({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: '#475569',
});

export const body = style({
  padding: '0.7rem 1rem',
  backgroundColor: '#0f172a',
  fontFamily: vars.font.mono,
  fontSize: '0.8rem',
  lineHeight: '1.6',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  '@media': {
    '(max-width: 640px)': {
      padding: '0.6rem 0.8rem',
      fontSize: '0.72rem',
    },
  },
});

export const commandLine = style({
  color: '#e2e8f0',
  selectors: {
    '&::before': {
      content: '"$ "',
      color: '#22c55e',
      fontWeight: 600,
    },
  },
});

export const outputLine = style({
  color: '#64748b',
  paddingLeft: '2px',
});
