import { IntroGuide } from '../components/IntroGuide';
import { LandingFeatures } from '../components/LandingFeatures';
import { SiteHeader } from '../components/SiteHeader';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { hasSeenIntro, rememberIntroVisit } from '../lib/returningUser';
import { supabase } from '../lib/supabase';
import { useAppSession } from '../lib/useAppSession';
import { useLandingReveal } from '../lib/useLandingReveal';

export function HomePage() {
  const [, setLocation] = useLocation();
  const { session, loading } = useAppSession();
  const [returningOnArrival] = useState(hasSeenIntro);
  const [checking, setChecking] = useState(true);
  const showIntro = new URLSearchParams(window.location.search).get('intro') === '1';
  useLandingReveal(!checking);

  useEffect(() => {
    if (showIntro) { rememberIntroVisit(); setChecking(false); return; }
    if (returningOnArrival) { setLocation('/dashboard'); return; }
    if (loading || !session) return;
    async function checkPlan() {
      const { count } = await supabase.from('subjects').select('id', { count: 'exact', head: true });
      if ((count ?? 0) > 0) { rememberIntroVisit(); setLocation('/dashboard'); return; }
      rememberIntroVisit(); setChecking(false);
    }
    void checkPlan();
  }, [loading, returningOnArrival, session, setLocation, showIntro]);

  if (checking) return <main className="centered">Открываю Трек…</main>;

  return (
    <main className="app-shell landing-page">
      <SiteHeader session={session} />
      <IntroGuide />
      <LandingFeatures />
    </main>
  );
}
