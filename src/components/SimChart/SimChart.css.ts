import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[6],
});

export const chartCard = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space[5],
});

export const chartTitle = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: vars.space[3],
});

export const chartContainer = style({
  width: '100%',
  height: '280px',
});
