import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { LandingCta } from './_landing/cta';
import { LandingFeatures } from './_landing/features';
import { LandingFooter } from './_landing/footer';
import { LandingHero } from './_landing/hero';
import { LandingNav } from './_landing/nav';
import { LandingPricing } from './_landing/pricing';
import { LandingSteps } from './_landing/steps';
import { LandingTrust } from './_landing/trust';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.user.isSuperAdmin ? '/admin' : '/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-slate-900">
      <LandingNav />
      <LandingHero />
      <LandingTrust />
      <LandingFeatures />
      <LandingSteps />
      <LandingPricing />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
