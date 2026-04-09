import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../styles/theme.css';

export const callout = recipe({
  base: {
    marginTop: '0.8rem',
    marginBottom: '0.8rem',
    padding: '0.8rem 1rem',
    borderLeft: '4px solid',
    borderRadius: '0 6px 6px 0',
    fontSize: '0.88rem',
    lineHeight: '1.7',
  },
  variants: {
    kind: {
      note: {
        backgroundColor: '#eff6ff',
        borderLeftColor: vars.color.accentInterrupt,
        color: vars.color.text,
      },
      warn: {
        backgroundColor: '#fffbeb',
        borderLeftColor: vars.color.accentAdaptive,
        color: vars.color.text,
      },
      tip: {
        backgroundColor: '#f0fdf4',
        borderLeftColor: vars.color.accentPolling,
        color: vars.color.text,
      },
      checkpoint: {
        backgroundColor: '#faf5ff',
        borderLeftColor: '#8b5cf6',
        color: vars.color.text,
      },
    },
  },
  defaultVariants: {
    kind: 'note',
  },
});

export const calloutTitle = recipe({
  base: {
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.3rem',
  },
  variants: {
    kind: {
      note: { color: vars.color.accentInterrupt },
      warn: { color: vars.color.accentAdaptive },
      tip: { color: vars.color.accentPolling },
      checkpoint: { color: '#8b5cf6' },
    },
  },
  defaultVariants: {
    kind: 'note',
  },
});
