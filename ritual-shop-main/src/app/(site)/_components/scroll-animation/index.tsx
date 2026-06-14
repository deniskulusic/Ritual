"use client";

import React, { useEffect, useRef } from "react";
import { getResponsiveScale, mergeTransform, clamp2 } from "./utils";

export type ScrollAnimationProps = {
  children: React.ReactNode;
  mode: "parallax" | "scaleTranslate";
  factor?: number;
  initialScale?: number;
  translateRange?: number;
  className?: string;
};

export function ScrollAnimation({
  children,
  mode,
  factor = 0.1,
  initialScale = 1.2,
  translateRange = 250,
  className = "",
}: ScrollAnimationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // We store the static offsetTop and height so the scroll loop is extremely fast
  const metricsRef = useRef({ offsetTop: 0, height: 0 });

  useEffect(() => {
    const updateMetrics = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      // rect.top is relative to viewport, so we add window.scrollY
      metricsRef.current = {
        offsetTop: window.scrollY + rect.top,
        height: wrapperRef.current.clientHeight,
      };
    };

    // Calculate metrics on mount. Add a small timeout to ensure layout is settled.
    const timer = setTimeout(updateMetrics, 100);

    // Recalculate metrics on resize
    window.addEventListener("resize", updateMetrics);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  useEffect(() => {
    const handleScroll = ({ scroll }: { scroll: number }) => {
      if (!wrapperRef.current || !elementRef.current) return;

      const vh = window.innerHeight;
      const rect = wrapperRef.current.getBoundingClientRect();

      // Visibility check: only animate if visible in the viewport
      if (
        rect.top - 1.5 * vh < 0 &&
        rect.top + metricsRef.current.height + 0.5 * vh > 0
      ) {
        const responsiveScale = getResponsiveScale();

        if (mode === "parallax") {
          // MODE 1: OLD PARALLAX (translate only)
          const val = factor * responsiveScale * (metricsRef.current.offsetTop - scroll);
          elementRef.current.style.transform = mergeTransform(elementRef.current, val);
        } else if (mode === "scaleTranslate") {
          // MODE 2: NEW SCALE + TRANSLATE ANIMATION
          const distanceFromTop = metricsRef.current.offsetTop - scroll;
          const totalDistance = vh + metricsRef.current.height;
          const distanceCovered = vh - distanceFromTop;

          const percent = clamp2(distanceCovered / totalDistance, 0, 1);

          // Scale calculation remains absolute (visual fit)
          const currentScale = initialScale - (initialScale - 1) * percent;

          // Apply responsiveScale to the translation range
          const scaledExtra = translateRange * responsiveScale;
          const translateY = -(scaledExtra / 2) + scaledExtra * percent;

          elementRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${currentScale})`;
        }
      }
    };

    let lenisInstance: any = null;
    let rafId: number;

    const checkLenis = () => {
      // @ts-expect-error - Adding to window for global access
      if (window.__lenis) {
        // @ts-expect-error
        lenisInstance = window.__lenis;
        lenisInstance.on("scroll", handleScroll);

        // Trigger once immediately in case we're already scrolled
        handleScroll({ scroll: lenisInstance.scroll || window.scrollY });
      } else {
        rafId = requestAnimationFrame(checkLenis);
      }
    };
    checkLenis();

    return () => {
      cancelAnimationFrame(rafId);
      if (lenisInstance) {
        lenisInstance.off("scroll", handleScroll);
      }
    };
  }, [mode, factor, initialScale, translateRange]);

  return (
    <div ref={wrapperRef} className={className}>
      <div ref={elementRef} style={{ width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
