import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

globalStyle('*, *::before, *::after', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('html', {
  scrollBehavior: 'smooth',
});

globalStyle('body', {
  fontFamily: vars.font.sans,
  fontSize: '0.92rem',
  lineHeight: '1.7',
  color: vars.color.text,
  backgroundColor: vars.color.bg,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  overflowWrap: 'break-word',
});

/* Heading hierarchy matching reference site */
globalStyle('h1, h2, h3, h4, h5, h6', {
  lineHeight: vars.lineHeight.tight,
  fontWeight: 600,
});

globalStyle('h2', {
  fontSize: '1.3rem',
  color: vars.color.navy,
  marginTop: '1.5rem',
  marginBottom: '0.6rem',
});

globalStyle('h3', {
  fontSize: '1.05rem',
  color: vars.color.accentInterrupt,
  marginTop: '1.2rem',
  marginBottom: '0.4rem',
});

globalStyle('h4', {
  fontSize: '0.95rem',
  color: vars.color.textMuted,
  marginTop: '1rem',
  marginBottom: '0.3rem',
});

globalStyle('a', {
  color: vars.color.accentInterrupt,
  textDecoration: 'none',
});

globalStyle('a:hover', {
  textDecoration: 'underline',
});

/* Inline code */
globalStyle('code', {
  fontFamily: vars.font.mono,
  fontSize: '0.85em',
  backgroundColor: '#f1f5f9',
  padding: '0.15em 0.4em',
  borderRadius: '4px',
  color: vars.color.text,
});

/* Reset code style inside pre (code blocks handle their own) */
globalStyle('pre code', {
  backgroundColor: 'transparent',
  padding: 0,
  borderRadius: 0,
  fontSize: 'inherit',
});

/* Shiki output: ensure readable text in dark code blocks */
globalStyle('.shiki', {
  backgroundColor: 'transparent !important' as string,
  margin: 0,
  padding: 0,
});

globalStyle('.shiki code', {
  backgroundColor: 'transparent',
  padding: 0,
  borderRadius: 0,
  color: '#e2e8f0',
});

globalStyle('.shiki .line span', {
  color: 'var(--shiki-dark, inherit)',
});

globalStyle('img', {
  maxWidth: '100%',
  height: 'auto',
});

/* Paragraph spacing */
globalStyle('p', {
  margin: '0.5rem 0',
});

/* List styles */
globalStyle('ul, ol', {
  margin: '0.5rem 0 0.5rem 1.5rem',
});

globalStyle('li', {
  margin: '0.25rem 0',
});

/* Table styles */
globalStyle('table', {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '0.8rem',
  marginBottom: '0.8rem',
  fontSize: '0.85rem',
});

/* On narrow screens, allow tables to scroll horizontally instead of overflowing the page */
globalStyle('table', {
  '@media': {
    '(max-width: 640px)': {
      display: 'block',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      whiteSpace: 'nowrap',
    },
  },
});

globalStyle('thead th', {
  backgroundColor: vars.color.navy,
  color: '#ffffff',
  fontWeight: 600,
  padding: '0.5rem 0.8rem',
  textAlign: 'left',
});

globalStyle('tbody td', {
  padding: '0.45rem 0.8rem',
  borderBottom: `1px solid ${vars.color.border}`,
});

globalStyle('tbody tr:nth-child(even)', {
  backgroundColor: '#f8fafc',
});
