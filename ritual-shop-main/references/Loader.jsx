import React, { useEffect, useRef } from 'react';

export const Loader = () => {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const ovrl = overlayRef.current;
    const logo = logoRef.current;
    const circle = circleRef.current;

    if (!ovrl || !logo || !circle) return;

    // 2. Setup Circle Math
    // Radius is automatically read from HTML exactly as vanilla
    let radius = circle.r.baseVal.value;
    let circumference = radius * 2 * Math.PI;

    // Initialize the circle to be "empty" (hidden stroke)
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    // 3. Execution Start
    if (window.__lenis) window.__lenis.stop();
    document.body.classList.add("preloader-active");

    // Step A: Fade In Logo
    const timerA = setTimeout(() => {
      logo.style.opacity = 1;
    }, 50);

    // Step B: Start Circle Animation
    const timerB = setTimeout(() => {
      circle.style.display = "block";
      void circle.clientWidth; // Force reflow
      circle.style.strokeDashoffset = 0;
    }, 400);

    let timerDestroy;

    // Step C: Finish Sequence
    const timerC = setTimeout(doneLoading, 1500);

    // 4. Completion Function
    function doneLoading() {
      document.body.classList.remove("preloader-active");

      if (window.__lenis) window.__lenis.start();

      // Dispatch custom event for Hero and Nav animations
      window.dispatchEvent(new Event('loader-complete'));

      // Fade out overlay
      ovrl.style.opacity = 0;
      timerDestroy = setTimeout(function () {
        ovrl.style.display = "none";
      }, 1000);
    }

    // Strict Cleanup
    return () => {
      clearTimeout(timerA);
      clearTimeout(timerB);
      clearTimeout(timerC);
      if (timerDestroy) clearTimeout(timerDestroy);

      document.body.classList.remove("preloader-active");
      if (window.__lenis) window.__lenis.start();
    };
  }, []);

  return (
    <div id="overlay" ref={overlayRef}>
      <div id="loader-container">
        <img 
          src="/assets/img/a.svg" 
          id="loader-logo" 
          alt="Logo" 
          ref={logoRef}
        />
        <svg className="loader-ring">
          <circle 
            className="progress-ring-circle" 
            stroke="#1A1E25" 
            strokeWidth="20" 
            fill="transparent" 
            r="180" 
            cx="400" 
            cy="200" 
            ref={circleRef}
          />
        </svg>
      </div>
    </div>
  );
};