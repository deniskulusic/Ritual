'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Preloader from './index';
import { useEntrance } from '../../../_components/entrance-provider';

export function PreloaderWrapper() {
  const { triggerEntrance } = useEntrance();
  const [isPreloading, setIsPreloading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop Lenis while preloading
    window.dispatchEvent(new Event('stopScroll'));

    // After 2.5 seconds, trigger the entrance animations
    const timer = setTimeout(() => {
      triggerEntrance();

      // The Hero animation takes 1.5s to slide over. Unmount preloader after it finishes.
      setTimeout(() => {
        setIsPreloading(false);
        window.dispatchEvent(new Event('startScroll'));
      }, 1500);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isPreloading) return null;

  return (
    <div ref={wrapperRef} className="preloader-wrapper">
      <Preloader />
    </div>
  );
}
