import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const stepsWrapper = style({
  marginTop: '0.8rem',
  marginBottom: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const step = style({
  display: 'flex',
  gap: '0.8rem',
});

export const stepNumber = style({
  flexShrink: 0,
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: vars.color.accentInterrupt,
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.78rem',
  marginTop: '1px',
});

export const stepContent = style({
  flex: 1,
  minWidth: 0,
});

export const stepTitle = style({
  fontSize: '1.05rem',
  fontWeight: 600,
  color: vars.color.navy,
  marginBottom: '0.3rem',
});
