import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { Loader } from './components/Loader';
import { TextSection } from './components/TextSection';
import { ArgoOverview } from './components/ArgoOverview';
import { ArgoDiscover } from './components/ArgoDiscover';
import { Navbar } from './components/Navbar';
import { MainSlider } from './components/MainSlider';
import { Accordion } from './components/Accordion';
import { ModalGallery } from './components/ModalGallery';
import { Hero } from './components/Hero';
import { BrochureDownload as Brochure } from './components/Brochure';
import { SocialSlider } from './components/SocialSlider';
import { Footer } from './components/Footer';

export const App = () => {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
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
      easing: (t) => 1 - Math.pow(1 - t, 3),
      lerp: 0.1,
      smoothWheel: true,
      smoothTouch: false,
      autoRaf: true,
    });
    
    lenisRef.current = lenis;
    window.__lenis = lenis;

    const raf = (time) => {
      lenis.raf(time);
      if (window.updateParallax) window.updateParallax();
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <>
      <Loader />
      <Navbar />
      <main id="top">

        <Hero />
        <TextSection
          className="section-2-argo first-section"
          paragraphText="Argo is a sanctuary of refined living, a five-star floating resort masterfully crafted for the world’s most discerning travelers. Across five expansive decks, this custom-built 55m masterpiece welcomes 26 guests into a world of curated elegance. Here, a dedicated 15-member crew anticipates every desire, inviting you into rhythms of ease."
          headingText='"Beyond the horizon. Beyond compare. The Argo experience."'
        />
        <ArgoOverview />
        <ArgoDiscover />
        <TextSection
          className="section-2-argo"
          paragraphText="Argo is the master key to the Adriatic’s legendary shores, unlocking hidden coves and iconic island towns with unrivaled grace. This voyage is a seamless blend of discovery and artistry, where our private chef transforms the local harvest into a bespoke culinary narrative, perfectly paired with the region’s finest vintages."
          headingText="There is yachting. Then there is Argo."
        />
        <MainSlider />
        <Brochure />
        <Accordion />
        <SocialSlider />
        <Footer />
        <ModalGallery />
      </main>
    </>
  );
};

export default App;