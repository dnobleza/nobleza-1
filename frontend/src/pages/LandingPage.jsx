// The public home page ("/"). It only puts the sections in order.
// Each section is its own component inside src/components/landing/.
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';

function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        {/* TEMPORARY placeholders so the navbar links can be tested. Replaced section by section. */}
        <section id="services" aria-label="Services" className="h-[80vh]" />
        <section id="portfolio" aria-label="Portfolio" className="h-[80vh]" />
        <section id="contact" aria-label="Contact" className="h-[80vh]" />
      </main>
    </>
  );
}

export default LandingPage;
