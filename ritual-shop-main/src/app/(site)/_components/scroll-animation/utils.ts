export function getResponsiveScale(): number {
  if (typeof window === "undefined") return 1;
  const maxW = 1920;
  const minW = 850;

  if (window.innerWidth >= maxW) return 1;
  if (window.innerWidth <= minW) return 0.5;

  const pct = (window.innerWidth - minW) / (maxW - minW);
  return 0.5 + pct * 0.5;
}

export function mergeTransform(el: HTMLElement, newTranslateY: number): string {
  let existing = el.style.transform;

  // If no inline transform, read “transform” from CSS rules (NOT the computed matrix)
  if (!existing) {
    existing = el.getAttribute("data-original-transform") || "";
    if (!existing) {
      // Extract raw CSS transform using computed style *but keep the string before conversion*
      const style = el.getAttribute("style") || "";
      const cssTransform = style.match(/transform:\s*([^;]+)/);

      if (cssTransform) {
        existing = cssTransform[1].trim();
      } else {
        // LAST RESORT: use computed transform ONLY if not "none"
        const computed = window.getComputedStyle(el).transform;
        existing = computed === "none" ? "" : computed;
      }
    }
  }

  // Remove old translateY()
  existing = (existing || "").replace(/translateY\([^)]*\)/g, "").trim();

  // Final combine
  if (!existing || existing === "none") {
    return `translateY(${newTranslateY}px)`;
  }

  return `${existing} translateY(${newTranslateY}px)`.trim();
}

export function clamp2(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
