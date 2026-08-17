import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (!target) { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); return; }
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: 'start' }), 0);
    return () => window.clearTimeout(timer);
  }, [location]);

  return null;
}
