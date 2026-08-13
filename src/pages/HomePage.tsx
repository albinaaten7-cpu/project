import { IntroGuide } from '../components/IntroGuide';
import { LandingFeatures } from '../components/LandingFeatures';
import { SiteHeader } from '../components/SiteHeader';
import { useExistingSession } from '../lib/useAppSession';
import { useLandingReveal } from '../lib/useLandingReveal';

export function HomePage() {
  useLandingReveal();
  const session = useExistingSession();

  return (
    <main className="app-shell landing-page">
      <SiteHeader session={session} />
      <IntroGuide />
      <LandingFeatures />
    </main>
  );
}
