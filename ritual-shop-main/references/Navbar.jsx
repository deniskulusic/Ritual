import React, { useState, useEffect, useRef } from 'react';

export const Navbar = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const menuBgRef = useRef(null);
  const menuFullRef = useRef(null);
  const scrollPosRef = useRef(0);

  const toggleMenu = () => {
    const nextState = !isMenuActive;
    setIsMenuActive(nextState);

    // Toggle classes exactly as vanilla
    if (menuFullRef.current) menuFullRef.current.classList.toggle("menu-active", nextState);
    if (menuBgRef.current) menuBgRef.current.classList.toggle("menu-active-bg", nextState);

    // Lenis toggle or native fallback
    if (window.__lenis) {
      if (nextState) {
        window.__lenis.stop();
      } else {
        window.__lenis.start();
      }
    } else {
      if (nextState) {
        // LOCK: Record position -> Fix body -> Offset top
        scrollPosRef.current = window.scrollY || window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosRef.current}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      } else {
        // UNLOCK: Remove styles -> Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollPosRef.current);
      }
    }
  };

  useEffect(() => {
    // Nav loaded timeout (from vanilla loadbar timeout)
    const loadTimeout = setTimeout(() => {
      if (menuFullRef.current) {
        menuFullRef.current.classList.add('nav-loaded');
      }
    }, 1500);

    // Scroll color inversion and hidden logic
    const handleScroll = () => {
      const scroll = window.__lenis ? window.__lenis.scroll : window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 1. Invert/Fill logic
      if (scroll > windowHeight - 100) {
        if (menuFullRef.current) {
          menuFullRef.current.classList.add('menu-filled', 'inverted');
        }
      } else {
        if (menuFullRef.current) {
          menuFullRef.current.classList.remove('menu-filled', 'inverted');
        }
      }

      // 2. Hide logic over .grow-section (from vanilla index.js)
      const growSections = document.querySelectorAll('.grow-section');
      let insideGrow = false;
      
      growSections.forEach(section => {
        const rectTop = section.offsetTop;
        const rectBottom = rectTop + section.offsetHeight;
        if (scroll >= rectTop && scroll < rectBottom) {
          insideGrow = true;
        }
      });

      if (insideGrow) {
        if (menuFullRef.current) menuFullRef.current.classList.add('menu-hidden');
      } else {
        if (menuFullRef.current) menuFullRef.current.classList.remove('menu-hidden');
      }
    };

    // Safely bind to Lenis even if it initializes slightly after Navbar mounts
    let lenisBound = false;
    window.addEventListener('scroll', handleScroll);

    const checkLenis = setInterval(() => {
      if (window.__lenis && !lenisBound) {
        window.__lenis.on('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
        lenisBound = true;
        clearInterval(checkLenis);
      }
    }, 100);

    // Run once on mount to set initial state
    handleScroll();

    // Cleanup
    return () => {
      clearTimeout(loadTimeout);
      clearInterval(checkLenis);
      window.removeEventListener('scroll', handleScroll);
      if (window.__lenis) {
        window.__lenis.off('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <div className="menu-bg" ref={menuBgRef}></div>
      <div className="menu-full" ref={menuFullRef}>
        <div className="navbar">
          <div className="han-menu-full" onClick={toggleMenu}>
            <div className="han-menu">
              <div className="han-burger"></div>
            </div>
            <div className="menu-text">MENU</div>
          </div>
          <img src="/assets/img/ARGO.svg" onClick={() => window.location.href = '/'} className="flex" alt="Argo Logo" style={{ cursor: 'pointer' }} />
          <div className="button-header-holder">
            <button className="main-button button-header">
              <a href="">contact broker</a>
            </button>
          </div>
        </div>
        <div className="menu-div maxw container" data-lenis-prevent="true">
          <div className="menu-div-left">
            <div className="menu-div-top grid">
              <div className="menu-div-left-1">
                <a href="the-yacht.html" title="The yacht">the yacht</a>
                <a href="crew.html" title="Crew">crew</a>
                <div className="nav-item-wrapper">
                  <a href="experiences.html" title="Experiences" className="nav-item-wrapper-heading">experiences</a>
                  <div className="sub-menu">
                    <a href="wellness-sanctuary.html">Wellness abroad</a>
                    <a href="culinary-journey.html">Culinary Journey</a>
                    <a href="on-board-experiences.html">On-Board Experiences</a>
                    <a href="off-board-adventures.html">Off-board Adventures</a>
                    <a href="the-family-collective.html">Family Collective</a>
                  </div>
                </div>
                <a href="retreats.html" title="Retreats">retreats</a>
                <a href="corporate.html" title="Corporate">corporate</a>
                <div className="nav-item-wrapper">
                  <a href="cruise-post.html" title="Events" className="nav-item-wrapper-heading">events</a>
                  <div className="sub-menu">
                    <a href="private-events.html">Private Events</a>
                    <a href="celebrations.html">Celebrations</a>
                    <a href="weddings.html">Weddings</a>
                    <a href="occasions.html">Special Occasions</a>
                    <a href="launches.html">Brand Launches & VIP Gatherings</a>
                  </div>
                </div>
                <a href="destinations.html" title="Destinations">destinations</a>
                <a href="about-us.html" title="About us">about us</a>
              </div>
              <div className="menu-div-right">
                <div className="lng">
                  <div className="lngo lngactive"><a href="">ENG</a></div>
                  <div className="lngo"><a href="">DE</a></div>
                  <div className="lngo"><a href="">IT</a></div>
                </div>
                <div className="menu-socials">
                  <a href="">
                    <img src="/assets/img/Link.svg" alt="Social Link" />
                  </a>
                  <a href="">
                    <img src="/assets/img/Link-1.svg" alt="Social Link" />
                  </a>
                </div>
              </div>
            </div>
            <div className="menu-div-left-2">
              <a href="faq.html"><span className="menu-div-secondary">FAQ</span></a>
              <a href="terms-and-conditions.html"><span className="menu-div-secondary">TERMS OF SERVICE</span></a>
              <a href="privacy-policy.html"><span className="menu-div-secondary">PRIVACY POLICY</span></a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};