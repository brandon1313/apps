import { PosterNav } from './components/PosterNav'
import { HeroSection } from './components/HeroSection'
import { IdentitySection } from './components/IdentitySection'
import { TraditionsSection } from './components/TraditionsSection'
import { NewsSection } from './components/NewsSection'
import { MayorSection } from './components/MayorSection'
import { LandingFooter } from './components/LandingFooter'

export function LandingPage() {
  return (
    <main className="poster-app">
      <PosterNav />
      <HeroSection />
      <IdentitySection />
      <TraditionsSection />
      <NewsSection />
      <MayorSection />
      <LandingFooter />
    </main>
  )
}
