import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../styles/theme.css';

export const stepItem = style({
  display: 'flex',
  gap: '1.2rem',
  position: 'relative',
  marginBottom: vars.space[4],
});

export const stepNumberCol = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexShrink: 0,
  width: '44px',
});

export const stepBadge = recipe({
  base: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1rem',
    color: '#ffffff',
    flexShrink: 0,
  },
  variants: {
    kind: {
      setup: { backgroundColor: vars.color.accentAdaptive },
      lab: { backgroundColor: vars.color.accentPolling },
      default: { backgroundColor: vars.color.navy },
    },
  },
  defaultVariants: { kind: 'default' },
});

export const connector = style({
  width: '2px',
  flexGrow: 1,
  backgroundColor: vars.color.border,
  marginTop: vars.space[2],
});

export const card = style({
  flex: 1,
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: '1.2rem 1.5rem',
  transition: 'box-shadow 0.2s, border-color 0.2s',
  selectors: {
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,51,102,0.08)',
      borderColor: '#c5d1e0',
    },
  },
});

export const cardLabel = recipe({
  base: {
    display: 'inline-block',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    padding: '0.15em 0.5em',
    borderRadius: vars.radius.sm,
    marginBottom: vars.space[2],
  },
  variants: {
    kind: {
      setup: {
        backgroundColor: '#fff7ed',
        color: vars.color.accentAdaptive,
      },
      lab: {
        backgroundColor: '#f0fdf4',
        color: vars.color.accentPolling,
      },
      default: {
        backgroundColor: '#eff6ff',
        color: vars.color.accentInterrupt,
      },
    },
  },
  defaultVariants: { kind: 'default' },
});

export const cardTitle = style({
  fontSize: '1.05rem',
  fontWeight: 600,
  color: vars.color.navy,
  marginBottom: vars.space[2],
});

export const cardDesc = style({
  fontSize: '0.85rem',
  lineHeight: vars.lineHeight.normal,
  color: vars.color.textMuted,
  marginBottom: vars.space[3],
});

export const toolBadges = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[2],
});

export const toolBadge = style({
  display: 'inline-block',
  fontSize: '0.72rem',
  padding: '0.2em 0.6em',
  borderRadius: vars.radius.sm,
  backgroundColor: '#eff6ff',
  color: vars.color.accentInterrupt,
  fontFamily: vars.font.mono,
});

export const cardLink = style({
  flex: 1,
  textDecoration: 'none',
  color: 'inherit',
  selectors: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
});
