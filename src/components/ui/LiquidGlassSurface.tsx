'use client';

import { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type LiquidGlassVariant = 'panel' | 'card' | 'pill' | 'modal' | 'status';

interface LiquidGlassSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: LiquidGlassVariant;
  active?: boolean;
  fullWidth?: boolean;
  tone?: 'neutral' | 'symbol' | 'emoji' | 'about' | 'success' | 'warning';
  ariaLabel?: string;
}

const TONE_BACKGROUND: Record<NonNullable<LiquidGlassSurfaceProps['tone']>, string> = {
  neutral: 'rgba(255,255,255,0.28)',
  symbol: 'linear-gradient(135deg, rgba(37,99,235,0.72), rgba(6,182,212,0.56))',
  emoji: 'linear-gradient(135deg, rgba(249,115,22,0.7), rgba(236,72,153,0.5))',
  about: 'linear-gradient(135deg, rgba(124,58,237,0.72), rgba(37,99,235,0.54))',
  success: 'linear-gradient(135deg, rgba(34,197,94,0.62), rgba(20,184,166,0.46))',
  warning: 'linear-gradient(135deg, rgba(251,146,60,0.62), rgba(245,158,11,0.44))'
};

export function LiquidGlassSurface({
  children,
  className = '',
  style,
  variant = 'panel',
  active = false,
  fullWidth,
  tone = 'neutral',
  ariaLabel,
  ...rest
}: LiquidGlassSurfaceProps) {
  const background = active ? TONE_BACKGROUND[tone] : TONE_BACKGROUND.neutral;
  const shouldFitContent = fullWidth === undefined
    ? variant === 'pill' || variant === 'status'
    : !fullWidth;
  const surfaceStyle: CSSProperties = {
    width: shouldFitContent ? 'fit-content' : '100%',
    overflow: 'hidden',
    '--stable-glass-bg': background,
    '--stable-glass-border': active ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.36)',
    boxShadow: active
      ? '0 14px 40px rgba(15, 23, 42, 0.18)'
      : '0 12px 34px rgba(15, 23, 42, 0.12)',
    ...style
  } as CSSProperties;

  return (
    <div
      className={`stable-glass stable-glass-${variant} ${active ? 'stable-glass-active' : ''} ${className}`}
      style={surfaceStyle}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </div>
  );
}
