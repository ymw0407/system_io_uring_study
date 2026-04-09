import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space[4],
  '@media': {
    '(max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const ruleCard = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: vars.space[4],
  borderLeft: `4px solid ${vars.color.border}`,
  transition: 'border-left-color 0.2s',
});

export const ruleCardInterrupt = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: vars.space[4],
  borderLeft: `4px solid ${vars.color.accentInterrupt}`,
});

export const ruleCardPolling = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: vars.space[4],
  borderLeft: `4px solid ${vars.color.accentPolling}`,
});

export const ruleCardCooldown = style({
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  padding: vars.space[4],
  borderLeft: `4px solid ${vars.color.gray}`,
});

export const ruleTitle = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: vars.space[2],
});

export const ruleCondition = style({
  fontSize: vars.fontSize.xs,
  fontFamily: vars.font.mono,
  color: vars.color.textMuted,
  marginBottom: vars.space[3],
  lineHeight: vars.lineHeight.normal,
});

export const triggerCount = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.text,
  lineHeight: vars.lineHeight.tight,
});

export const triggerLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  marginLeft: vars.space[2],
  fontWeight: 400,
});

export const triggerCountInterrupt = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.accentInterrupt,
  lineHeight: vars.lineHeight.tight,
});

export const triggerCountPolling = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.accentPolling,
  lineHeight: vars.lineHeight.tight,
});

export const triggerCountCooldown = style({
  fontSize: vars.fontSize['2xl'],
  fontWeight: 700,
  fontFamily: vars.font.mono,
  color: vars.color.gray,
  lineHeight: vars.lineHeight.tight,
});
