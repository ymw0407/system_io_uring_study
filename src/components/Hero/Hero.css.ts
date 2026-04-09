import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const hero = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: `${vars.space[16]} ${vars.space[6]}`,
  background: `linear-gradient(135deg, ${vars.color.heroGradientFrom}, ${vars.color.heroGradientTo})`,
  color: '#ffffff',
});

export const title = style({
  fontSize: '1.8rem',
  fontWeight: 700,
  color: '#ffffff',
  marginBottom: vars.space[3],
  letterSpacing: '-0.01em',
});

export const subtitle = style({
  fontSize: '0.95rem',
  color: 'rgba(255,255,255,0.85)',
  maxWidth: '640px',
  lineHeight: vars.lineHeight.relaxed,
  marginBottom: vars.space[6],
});

export const meta = style({
  display: 'flex',
  gap: vars.space[3],
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
});

export const badge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `0.2em 0.7em`,
  borderRadius: vars.radius.sm,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: vars.color.badge,
  color: vars.color.navy,
});

export const tag = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: `0.2em 0.6em`,
  borderRadius: vars.radius.sm,
  fontSize: '0.72rem',
  fontFamily: vars.font.mono,
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.9)',
});
