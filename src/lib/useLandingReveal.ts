import { useEffect } from 'react';

export function useLandingReveal(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const slides = Array.from(document.querySelectorAll<HTMLElement>('.landing-slide'));
    root.classList.add('landing-scroll', 'reveal-ready');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.22 });

    slides.forEach((slide) => observer.observe(slide));
    return () => {
      observer.disconnect();
      root.classList.remove('landing-scroll', 'reveal-ready');
    };
  }, [enabled]);
}
