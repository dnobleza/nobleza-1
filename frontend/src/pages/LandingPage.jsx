// The public home page ("/"). It only puts the sections in order.
// Each section is its own component inside src/components/landing/.
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import WhyChooseSection from '../components/landing/WhyChooseSection';
import ServicesSection from '../components/landing/ServicesSection';

function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />

        {/* Light-blue page area under the hero (sections 2 to 6). overflow-x-clip cuts off
            anything that sticks out sideways, so the clouds can never cause a horizontal scrollbar. */}
        <div className="relative overflow-x-clip bg-linear-to-b from-sky via-sky-light to-sky">
          {/* Soft white clouds on the left and right edges. Decoration only, so aria-hidden. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-16 h-36 w-72 rounded-full bg-white opacity-90 blur-md" />
            <div className="absolute -right-28 top-[26rem] h-40 w-80 rounded-full bg-white opacity-90 blur-md" />
            <div className="absolute -left-20 top-[48rem] h-36 w-64 rounded-full bg-white opacity-90 blur-md" />
            <div className="absolute -right-24 top-[70rem] h-40 w-72 rounded-full bg-white opacity-90 blur-md" />
          </div>

          <WhyChooseSection />
          <ServicesSection />

          {/* TEMPORARY placeholders so the navbar links can be tested. Replaced section by section. */}
          <section id="portfolio" aria-label="Portfolio" className="relative h-[80vh]" />
          <section id="contact" aria-label="Contact" className="relative h-[80vh]" />
        </div>
      </main>
    </>
  );
}

export default LandingPage;
