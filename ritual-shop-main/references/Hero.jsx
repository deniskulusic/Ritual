import React, { useEffect, useRef } from 'react';

export const Hero = () => {
  const videoDesktopRef = useRef(null);
  const videoMobileRef = useRef(null);
  const headerRef = useRef(null);
  const headerTextRef = useRef(null);

  useEffect(() => {
    // Replicating the vanilla IntersectionObserver for video play/pause
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.offsetWidth > 0 && video.offsetHeight > 0) {
            video.play().catch(e => console.log("Auto-play prevented", e));
          }
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.1
    });

    if (videoDesktopRef.current) observer.observe(videoDesktopRef.current);
    if (videoMobileRef.current) observer.observe(videoMobileRef.current);

    return () => {
      if (videoDesktopRef.current) observer.unobserve(videoDesktopRef.current);
      if (videoMobileRef.current) observer.unobserve(videoMobileRef.current);
    };
  }, []);

  useEffect(() => {
    // A. Preloader Fade-In (<header>)
    const loadTimer = setTimeout(() => {
      if (headerRef.current) {
        headerRef.current.classList.add('header-loaded');
      }
    }, 1500);

    // B. Parallax Scrolling ([data-lenis-speed])
    const SCALE = 0.1;

    const handleScroll = ({ scroll }) => {
      const WindowHeight = window.innerHeight;
      const parallaxElements = [headerRef.current, headerTextRef.current];

      parallaxElements.forEach((el) => {
        if (el) {
          const speed = parseFloat(el.dataset.lenisSpeed) || 0;
          if (scroll < 1.5 * WindowHeight) {
            el.style.transform = `translate3d(0, ${scroll * speed * SCALE}px, 0)`;
          }
        }
      });
    };

    let lenisInstance = null;
    let rafId;

    // In React, child useEffects run BEFORE parent useEffects.
    // We must wait for App.jsx to initialize window.__lenis.
    const checkLenis = () => {
      if (window.__lenis) {
        lenisInstance = window.__lenis;
        lenisInstance.on('scroll', handleScroll);
        
        // Trigger once immediately in case we're already scrolled
        handleScroll({ scroll: window.__lenis.scroll || window.scrollY });
      } else {
        rafId = requestAnimationFrame(checkLenis);
      }
    };
    checkLenis();

    return () => {
      clearTimeout(loadTimer);
      cancelAnimationFrame(rafId);
      if (lenisInstance) {
        lenisInstance.off('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <section className="header header-2">
      <header ref={headerRef} data-lenis-speed="8">
        <div className="maxw container grid">
          <div ref={headerTextRef} className="header-text pt-[10vh]" data-lenis-speed="-2">
            <h1>Argo: Redefining the Art of Yachting in Croatia</h1>
            <button className="main-button">
              <a href="the-yacht.html">About us</a>
            </button>
          </div>
        </div>
        <a href="" className="booking-div">
          <div className="booking-div-left"><img src="/assets/img/a.svg" alt="" /></div>
          <div className="booking-div-right"><span className="booking-div-right-1">CONTACT YOUR PREFERED YACHT BROKER</span></div>
        </a>
        <div className="header-tint"></div>

        <video ref={videoDesktopRef} autoPlay loop muted playsInline poster="/assets/argo/1.webp" className="video-desktop hero-video">
          <source src="/assets/video/argo-landscape.mp4" type="video/mp4" />
        </video>

        <video ref={videoMobileRef} autoPlay loop muted playsInline poster="/assets/argo/1.webp" className="video-mobile hero-video">
          <source src="/assets/video/argo-portrait.mp4" type="video/mp4" />
        </video>
      </header>
    </section>
  );
};