"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useEntrance } from "../../../_components/entrance-provider";
import { ResolvedLink } from "../../../_components/resolved-link";
import styles from "./home-hero.module.css";

type HomeHeroProps = {
  hero: {
    backgroundImage: {
      alt: string;
      src: string;
    };
    description: string;
    highlights: {
      icon: {
        alt: string;
        src: string;
      };
      label: string;
    }[];
    primaryCtaLabel: string;
    primaryCtaLink: null | {
      href: string;
      kind: "internal" | "external";
      label: string;
      openInNewTab: boolean;
    };
    title: string;
  };
};

function renderTitle(title: string) {
  return title.split(/\r?\n/g).map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export function HomeHero({ hero }: HomeHeroProps) {
  const { isEntranceReady } = useEntrance();
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!isEntranceReady || !heroRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Ensure the hero section is above the preloader exactly when triggered
      gsap.set(heroRef.current, { zIndex: 9999999, position: 'relative' });

      // Hero Container: slide down from top using clip-path
      tl.fromTo(
        heroRef.current,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "power4.inOut" }
      );

      // Hero Text: slide up and fade in, starting 0.5s before container finishes
      tl.fromTo(
        contentRef.current!.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" },
        "-=0.7"
      );
    });

    return () => ctx.revert();
  }, [isEntranceReady]);

  useEffect(() => {
    const SCALE = 0.1;

    const handleScroll = ({ scroll }: { scroll: number }) => {
      const WindowHeight = window.innerHeight;
      const parallaxElements = [bgRef.current, contentRef.current];

      parallaxElements.forEach((el) => {
        if (el) {
          const speed = parseFloat(el.dataset.lenisSpeed || "0") || 0;
          if (scroll < 1.5 * WindowHeight) {
            el.style.transform = `translate3d(0, ${scroll * speed * SCALE}px, 0)`;
          }
        }
      });
    };

    let lenisInstance: any = null;
    let rafId: number;

    const checkLenis = () => {
      // @ts-expect-error
      if (window.__lenis) {
        // @ts-expect-error
        lenisInstance = window.__lenis;
        lenisInstance.on('scroll', handleScroll);
        
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
        lenisInstance.off('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>
      <img ref={bgRef} data-lenis-speed="8" className={styles.background} src={hero.backgroundImage.src} alt={hero.backgroundImage.alt} />
      <div className={styles.tint} />
      <div className={styles.inner}>
        <div ref={contentRef} data-lenis-speed="5W" className={styles.content}>
          <h1>{renderTitle(hero.title)}</h1>
          <h3>{hero.description}</h3>
          {hero.primaryCtaLink ? (
            <div className={styles.ctaWrap}>
              <ResolvedLink link={hero.primaryCtaLink} className={styles.cta}>
                {hero.primaryCtaLabel}
              </ResolvedLink>
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.highlightRail} aria-label="Izdvojene pogodnosti">
        {hero.highlights.map((item) => (
          <div key={`${item.label}-${item.icon.src}`} className={styles.highlightItem}>
            <img src={item.icon.src} alt="" aria-hidden="true" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
