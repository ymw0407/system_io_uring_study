import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const page = style({
  minHeight: '100vh',
});

export const hero = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: `${vars.space[12]} ${vars.space[6]}`,
  background: `linear-gradient(135deg, ${vars.color.heroGradientFrom}, ${vars.color.heroGradientTo})`,
  color: '#ffffff',
  '@media': {
    '(max-width: 640px)': {
      padding: `${vars.space[8]} ${vars.space[4]}`,
    },
  },
});

export const heroTitle = style({
  fontSize: vars.fontSize['3xl'],
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: vars.space[3],
  letterSpacing: '-0.01em',
  '@media': {
    '(max-width: 640px)': {
      fontSize: vars.fontSize['2xl'],
    },
  },
});

export const heroSubtitle = style({
  fontSize: vars.fontSize.base,
  color: 'rgba(255,255,255,0.85)',
  maxWidth: '640px',
  lineHeight: vars.lineHeight.relaxed,
  '@media': {
    '(max-width: 640px)': {
      fontSize: vars.fontSize.sm,
    },
  },
});

export const content = style({
  maxWidth: vars.maxWidth.prose,
  margin: '0 auto',
  padding: `${vars.space[10]} ${vars.space[6]}`,
  '@media': {
    '(max-width: 640px)': {
      padding: `${vars.space[6]} ${vars.space[4]}`,
    },
  },
});

export const sectionTitle = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  color: vars.color.navy,
  marginBottom: vars.space[6],
  '@media': {
    '(max-width: 640px)': {
      fontSize: vars.fontSize.xl,
      marginBottom: vars.space[4],
    },
  },
});

export const tableWrapper = style({
  overflowX: 'auto',
  marginBottom: vars.space[10],
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.normal,
});

export const th = style({
  textAlign: 'left',
  padding: `${vars.space[3]} ${vars.space[4]}`,
  borderBottom: `2px solid ${vars.color.border}`,
  fontWeight: 600,
  color: vars.color.navy,
  whiteSpace: 'nowrap',
});

export const td = style({
  padding: `${vars.space[3]} ${vars.space[4]}`,
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.text,
});

export const cardGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: vars.space[6],
  '@media': {
    '(max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const card = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: `${vars.space[6]} ${vars.space[6]}`,
  textDecoration: 'none',
  color: 'inherit',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  selectors: {
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,51,102,0.08)',
      borderColor: '#c5d1e0',
      textDecoration: 'none',
    },
  },
});

export const cardTitle = style({
  fontSize: vars.fontSize.xl,
  fontWeight: 600,
  color: vars.color.navy,
});

export const cardDesc = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.normal,
  color: vars.color.textMuted,
});

export const cardArrow = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.accentInterrupt,
  marginTop: 'auto',
});
