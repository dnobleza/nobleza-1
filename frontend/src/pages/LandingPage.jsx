// The public home page ("/"). It only puts the sections in order.
// Each section is its own component inside src/components/landing/.
import LandingNavbar from '../components/landing/LandingNavbar';

function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        {/* TEMPORARY placeholders so the navbar links can be tested. Replaced section by section. */}
        <h1 className="sr-only">CodeHaus</h1>
        <section id="home" aria-label="Home" className="h-[80vh]" />
        <section id="services" aria-label="Services" className="h-[80vh]" />
        <section id="portfolio" aria-label="Portfolio" className="h-[80vh]" />
        <section id="contact" aria-label="Contact" className="h-[80vh]" />
      </main>
    </>
  );
}

export default LandingPage;
