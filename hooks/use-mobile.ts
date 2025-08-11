'use client';

import { useEffect, useState } from 'react';
import { BREAKPOINTS } from '@/lib/constants';

export function useMobile(breakpoint: keyof typeof BREAKPOINTS = 'md') {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS[breakpoint]);
    };

    // Check on mount
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}