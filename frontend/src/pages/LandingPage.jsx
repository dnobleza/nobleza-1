// The public home page ("/"). It only puts the sections in order.
// Each section is its own component inside src/components/landing/.
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import WhyChooseSection from '../components/landing/WhyChooseSection';
import ServicesSection from '../components/landing/ServicesSection';
import PortfolioSection from '../components/landing/PortfolioSection';
import Testimonials from '../components/landing/Testimonials';
import CtaSection from '../components/landing/CtaSection';
import LandingFooter from '../components/landing/LandingFooter';

function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />

        {/* Cool-gray page area under the hero (sections 2 to 6): one solid color, so the
            white cards stand out against it. */}
        <div className="relative bg-surface-cool">
          <WhyChooseSection />
          <ServicesSection />
          <PortfolioSection />
          <Testimonials />
          <CtaSection />
        </div>
      </main>
      <LandingFooter />
    </>
  );
}

export default LandingPage;
