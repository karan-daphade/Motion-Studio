// src/components/text/FitText.tsx
// Pure Text Fitting Primitive using @remotion/layout-utils (LOC-03)

import React, { useMemo } from 'react';
import { fitText as remotionFitText } from '@remotion/layout-utils';
import { useTheme } from '../../theme';

export interface FitTextProps {
  text: string;
  withinWidth: number;
  maxFontSize?: number;
  minFontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const FitText: React.FC<FitTextProps> = ({
  text,
  withinWidth,
  maxFontSize = 48,
  minFontSize = 10,
  fontFamily: explicitFamily,
  fontWeight = 600,
  style,
  className,
}) => {
  const { fontFamily: themeFamily } = useTheme();
  const activeFamily = explicitFamily || themeFamily || 'sans-serif';

  const calculatedSize = useMemo(() => {
    try {
      const { fontSize } = remotionFitText({
        text,
        withinWidth,
        fontFamily: activeFamily,
        fontWeight,
        validateFontIsLoaded: false,
      });

      return Math.max(minFontSize, Math.min(maxFontSize, fontSize));
    } catch {
      // Fallback in headless / non-canvas environments
      const approxCharWidth = 0.55;
      const estimated = withinWidth / (text.length * approxCharWidth);
      return Math.max(minFontSize, Math.min(maxFontSize, Math.floor(estimated)));
    }
  }, [text, withinWidth, activeFamily, fontWeight, minFontSize, maxFontSize]);

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        fontSize: calculatedSize,
        fontFamily: activeFamily,
        fontWeight,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: withinWidth,
        lineHeight: 1.4,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
