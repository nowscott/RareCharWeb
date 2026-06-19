'use client';

import { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { LiquidGlass, LiquidGlassProps } from 'simple-liquid-glass';

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

const VARIANT_PROPS: Record<LiquidGlassVariant, Partial<LiquidGlassProps>> = {
  panel: {
    radius: 32,
    scale: 90,
    blur: 5,
    frost: 0.1,
    dispersion: 20,
    aberrationIntensity: 0.18,
    saturation: 155,
    quality: 'low',
    lens: 'rim',
    lensStrength: 0.42
  },
  card: {
    radius: 24,
    scale: 105,
    blur: 5,
    frost: 0.11,
    dispersion: 24,
    aberrationIntensity: 0.22,
    saturation: 160,
    quality: 'low',
    lens: 'rim',
    lensStrength: 0.5
  },
  pill: {
    radius: 999,
    scale: 120,
    blur: 5,
    frost: 0.12,
    dispersion: 26,
    aberrationIntensity: 0.24,
    saturation: 165,
    quality: 'low',
    lens: 'convex',
    lensStrength: 0.48
  },
  modal: {
    radius: 32,
    scale: 130,
    blur: 7,
    frost: 0.14,
    dispersion: 30,
    aberrationIntensity: 0.28,
    saturation: 170,
    quality: 'standard',
    lens: 'convex',
    lensStrength: 0.58
  },
  status: {
    radius: 999,
    scale: 80,
    blur: 5,
    frost: 0.12,
    dispersion: 18,
    aberrationIntensity: 0.16,
    saturation: 155,
    quality: 'low',
    lens: 'shift',
    lensStrength: 0.32
  }
};

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
  const variantProps = VARIANT_PROPS[variant];
  const background = active ? TONE_BACKGROUND[tone] : TONE_BACKGROUND.neutral;
  const shouldUseLibrary = variant === 'pill';
  const shouldFitContent = fullWidth === undefined
    ? variant === 'pill' || variant === 'status'
    : !fullWidth;
  const surfaceStyle: CSSProperties = {
    width: shouldFitContent ? 'fit-content' : '100%',
    height: 'auto',
    overflow: 'hidden',
    '--stable-glass-bg': background,
    '--stable-glass-border': active ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.36)',
    boxShadow: active
      ? '0 14px 40px rgba(15, 23, 42, 0.18)'
      : '0 12px 34px rgba(15, 23, 42, 0.12)',
    ...style
  } as CSSProperties;

  if (!shouldUseLibrary) {
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

  return (
    <LiquidGlass
      {...variantProps}
      background={background}
      glassColor={active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.18)'}
      borderColor={active ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.48)'}
      effectMode="blur"
      mobileFallback="css-only"
      iosBlurMode="auto"
      className={`liquid-surface-content ${className}`}
      style={surfaceStyle}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </LiquidGlass>
  );
}
