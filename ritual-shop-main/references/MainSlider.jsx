import React, { useRef, useEffect, useState } from 'react';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export const MainSlider = ({ children }) => {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const imgRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const contentHeightRef = useRef(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        contentHeightRef.current = entry.contentRect.height;
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    
    // Initial calculation
    contentHeightRef.current = contentRef.current.getBoundingClientRect().height;
    setContentHeight(contentHeightRef.current);

    return () => observer.disconnect();
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

    const updateScroll = (e) => {
      if (!section || !frame || !content) return;
      
      // Use lenis scroll if available (passed via event), else native scroll
      const currentScroll = e && typeof e.scroll !== 'undefined' ? e.scroll : window.scrollY;
      
      // Calculate scroll position relative to the top of this section
      const scrollY = currentScroll - sectionTop;

      // 1. Frame Clip-Path & Image Scale Logic
      // Expand circle from 25% to 85% over the first 120vh of scrolling
      const growProgress = clamp(scrollY / growDistance, 0, 1);
      const circleRadius = lerp(25, 85, growProgress);
      frame.style.clipPath = `circle(${circleRadius}% at 50% 50%)`;

      // Scale image down from 1.3 to 1.0 to add smooth parallax feel
      if (imgRef.current) {
        const imgScale = lerp(1.3, 1, growProgress);
        imgRef.current.style.transform = `scale(${imgScale})`;
      }

      // 2. Content Visibility and Scroll Logic
      if (scrollY < growDistance) {
        // While growing, fade in the content
        // User wants it to start fading in when circle reaches 65% and fully visible by 75%
        const opacityProgress = clamp((circleRadius - 65) / (75 - 65), 0, 1);
        content.style.opacity = opacityProgress;
        content.style.pointerEvents = 'none'; // Prevent interaction while fading in
        content.style.transform = `translate3d(0, 0px, 0)`;
      } else {
        // Grow finished, start scrolling the content up
        content.style.opacity = 1;
        content.style.pointerEvents = 'auto';
        
        // Clamp the overscroll so it stops translating exactly when the sticky container unpins
        const maxOverScroll = Math.max(0, contentHeightRef.current - window.innerHeight);
        const overScroll = clamp(scrollY - growDistance, 0, maxOverScroll);
        
        content.style.transform = `translate3d(0, -${overScroll}px, 0)`;
      }
    };

    updateScroll(); // initial state

    let lenisInterval;
    const attachLenis = () => {
      if (window.__lenis) {
        window.__lenis.on('scroll', updateScroll);
        clearInterval(lenisInterval);
      }
    };

    if (window.__lenis) {
      window.__lenis.on('scroll', updateScroll);
    } else {
      lenisInterval = setInterval(attachLenis, 50);
    }

    // Only attach native scroll listener if Lenis isn't handling it, or as a fallback
    const nativeScrollFallback = () => {
      if (!window.__lenis) updateScroll();
    };
    window.addEventListener('scroll', nativeScrollFallback, { passive: true });

    return () => {
      clearInterval(lenisInterval);
      if (window.__lenis) {
        window.__lenis.off('scroll', updateScroll);
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
        height: `calc(120vh + ${Math.max(contentHeight, typeof window !== 'undefined' ? window.innerHeight : 0)}px)`
      }}
    >
      <div className="sticky-container">
        <div className="frame" ref={frameRef}>
          <picture>
            <img src="/assets/argo/1.webp" alt="Argo Yacht" ref={imgRef} />
          </picture>
        </div>
        <div className="scroll-content" ref={contentRef}>
          {children}
        </div>
      </div>
    </section>
  );
};