"use client";

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import './parallax-slider.css';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface ParallaxSliderProps {
  children: ReactNode;
  imageSrc?: string;
}

export const ParallaxSlider: React.FC<ParallaxSliderProps> = ({ 
  children, 
  imageSrc = "/assets/argo/1.webp" 
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const contentHeightRef = useRef(0);

  useEffect(() => {
    // Get window height safely on the client to avoid SSR hydration mismatch
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize, { passive: true });

    if (contentRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          contentHeightRef.current = entry.contentRect.height;
          setContentHeight(entry.contentRect.height);
        }
      });
      observer.observe(contentRef.current);
      
      // Initial calculation
      contentHeightRef.current = contentRef.current.getBoundingClientRect().height;
      setContentHeight(contentHeightRef.current);

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;

    if (!section || !frame || !content) return;

    let sectionTop = 0;
    const measure = () => {
      if (section) {
        sectionTop = section.getBoundingClientRect().top + window.scrollY;
      }
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });

    // Define scroll distances
    // The height over which the background scales up from 0.7 to 1.0
    const growDistance = window.innerHeight * 1.2; // 120vh

    const updateScroll = (e?: any) => {
      if (!section || !frame || !content) return;
      
      // Use lenis scroll if available (passed via event), else native scroll
      const currentScroll = e && typeof e.scroll !== 'undefined' ? e.scroll : window.scrollY;
      
      // Calculate scroll position relative to the top of this section
      const scrollY = currentScroll - sectionTop;

      // 1. Frame Clip-Path & Image Scale Logic
      // Expand circle from 25% to 85% over the first 120vh of scrolling
      const growProgress = clamp(scrollY / growDistance, 0, 1);
      const circleRadius = lerp(15, 75, growProgress);
      frame.style.clipPath = `circle(${circleRadius}% at 50% 50%)`;

      // Scale image down from 1.3 to 1.0 to add smooth parallax feel
      if (imgRef.current) {
        const imgScale = lerp(1.5, 1, growProgress);
        imgRef.current.style.transform = `scale(${imgScale})`;
      }

      // 2. Content Visibility and Scroll Logic
      if (scrollY < growDistance) {
        // While growing, fade in the content
        // User wants it to start fading in when circle reaches 65% and fully visible by 75%
        const opacityProgress = clamp((circleRadius - 35) / (70 - 35), 0, 1);
        content.style.opacity = opacityProgress.toString();
        content.style.pointerEvents = 'none'; // Prevent interaction while fading in
        content.style.transform = `translate3d(0, 0px, 0)`;
      } else {
        // Grow finished, start scrolling the content up
        content.style.opacity = '1';
        content.style.pointerEvents = 'auto';
        
        // Clamp the overscroll so it stops translating exactly when the sticky container unpins
        const maxOverScroll = Math.max(0, contentHeightRef.current - window.innerHeight);
        const overScroll = clamp(scrollY - growDistance, 0, maxOverScroll);
        
        content.style.transform = `translate3d(0, -${overScroll}px, 0)`;
      }

      // 3. Header Visibility Logic
      const headerEl = document.querySelector('header');
      if (headerEl) {
        if (scrollY >= 0 && scrollY < section.offsetHeight) {
          headerEl.style.opacity = "0";
  
        } else {
          headerEl.style.opacity = "1";

        }
      }
    };

    updateScroll(); // initial state

    let lenisInterval: ReturnType<typeof setInterval>;
    const attachLenis = () => {
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.on('scroll', updateScroll);
        clearInterval(lenisInterval);
      }
    };

    if (typeof window !== 'undefined' && (window as any).__lenis) {
      (window as any).__lenis.on('scroll', updateScroll);
    } else {
      lenisInterval = setInterval(attachLenis, 50);
    }

    // Only attach native scroll listener if Lenis isn't handling it, or as a fallback
    const nativeScrollFallback = () => {
      if (typeof window === 'undefined' || !(window as any).__lenis) updateScroll();
    };
    window.addEventListener('scroll', nativeScrollFallback, { passive: true });

    return () => {
      clearInterval(lenisInterval);
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.off('scroll', updateScroll);
      }
      window.removeEventListener('scroll', nativeScrollFallback);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="grow-wrapper"
      style={{
        // Total height = 120vh (grow distance) + content height (min 100vh to fill screen)
        height: `calc(120vh + ${Math.max(contentHeight, windowHeight)}px)`
      }}
    >
      <div className="sticky-container">
        <div className="mug-image-holder">
          <div className="mug-image">
          </div>
        </div>
        <div 
          className="frame"
          ref={frameRef}
        >
          <picture>
            <div className="image-wrapper" ref={imgRef}>
            </div>
          </picture>
        </div>
        <div 
          className="scroll-content"
          ref={contentRef}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default ParallaxSlider;
