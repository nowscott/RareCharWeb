'use client';

import { useEffect, useRef, useState } from 'react';
import { aboutConfig } from './aboutConfig';

export function clearCacheAndReload(): void {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
}

export function useBackdoorClick(onTrigger: () => void) {
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  void clickCount;

  const handleClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;

      if (newCount >= aboutConfig.backdoor.clickThreshold) {
        onTrigger();
        return 0;
      }

      return newCount;
    });

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, aboutConfig.backdoor.resetTimeout);
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  return handleClick;
}
