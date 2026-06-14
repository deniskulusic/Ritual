'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.documentElement.style.scrollBehavior = 'smooth';
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: false, // We'll manage the raf loop ourselves as per reference
    });
    
    lenisRef.current = lenis;
    // @ts-expect-error - Adding to window for global access if needed
    window.__lenis = lenis;

    const stopLenis = () => lenis.stop();
    const startLenis = () => lenis.start();

    // Custom events to stop/start Lenis when preloader is active
    window.addEventListener('stopScroll', stopLenis);
    window.addEventListener('startScroll', startLenis);

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener('stopScroll', stopLenis);
      window.removeEventListener('startScroll', startLenis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      // @ts-expect-error
      window.__lenis = null;
    };
  }, []);

  return <>{children}</>;
}
