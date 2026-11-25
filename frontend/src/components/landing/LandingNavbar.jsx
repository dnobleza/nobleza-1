import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo/logo.svg';

// The four page sections the links point to. "id" must match the id on the <section>.
const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
];

// Shared look for keyboard focus (the ring you see when you press Tab).
const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-deep';

function LandingNavbar() {
  // useState remembers a value between renders.
  // isOpen: is the mobile menu open? (starts closed)
  // activeId: which section is on screen right now? (starts at the top)
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState('home');

  // A ref is a handle to a real DOM element. We use it to give focus back to the hamburger button.
  const menuButtonRef = useRef(null);

  // useEffect runs code AFTER the page is drawn. The [] at the end means "only once, on load".
  // Here it sets up an IntersectionObserver: a browser tool that tells us when an element
  // enters or leaves the screen, so we do not need a slow scroll listener.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // The browser calls this function whenever a watched section crosses the "band" below.
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      // The band is a thin strip across the screen, from 40% to 45% of the way down.
      // A section counts as "current" while it touches that strip.
      { rootMargin: '-40% 0px -55% 0px' },
    );

    NAV_LINKS.forEach((link) => {
      const section = document.getElementById(link.id);
      if (section) {
        observer.observe(section); // start watching this section
      }
    });

    // The function we return is the "cleanup": React runs it when the navbar goes away.
    return () => observer.disconnect();
  }, []);

  // A second effect: while the mobile menu is open, pressing Escape closes it.
  // [isOpen] means "run again whenever isOpen changes".
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  function linkClasses(id) {
    const isActive = id === activeId;
    return `relative rounded-full px-3 py-2 text-base font-medium transition-colors duration-150 ${focusRing} ${
      isActive ? 'font-semibold text-navy-deep' : 'text-navy-deep hover:text-primary-deep'
    }`;
  }

  return (
    <header className="sticky top-4 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <nav
          aria-label="Main"
          className="flex items-center justify-between gap-4 rounded-full border border-white/50 bg-surface px-4 py-3 shadow-[0_10px_30px_-12px_rgb(37_99_235/0.25)] supports-[backdrop-filter]:bg-white/85 supports-[backdrop-filter]:backdrop-blur-xl reduced-transparency:bg-surface reduced-transparency:backdrop-blur-none sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]"
        >
          <a href="#home" className={`ml-2 shrink-0 justify-self-start rounded-full lg:ml-4 ${focusRing}`}>
            {/* Sized by height so the bar stays about 64px tall; width follows the logo's shape. */}
            <img
              src={logo}
              alt="CodeHaus"
              width={486}
              height={330}
              className="h-8 w-auto lg:h-10"
            />
          </a>

          {/* Desktop links (hidden below 1024px) */}
          <ul className="hidden items-center gap-2 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={link.id === activeId ? 'location' : undefined}
                  className={linkClasses(link.id)}
                >
                  {link.label}
                  {link.id === activeId && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-navy-deep"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 justify-self-end">
            {/* Desktop buttons */}
            <Link
              to="/login"
              className={`hidden rounded-full border border-primary bg-surface px-6 py-2 text-base font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft hover:text-primary-deep lg:inline-block ${focusRing}`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`hidden rounded-full bg-accent-strong px-6 py-2 text-base font-semibold text-white transition-colors duration-150 hover:bg-accent-strong-hover lg:inline-block ${focusRing}`}
            >
              Start a project
            </Link>

            {/* Hamburger button (hidden from 1024px up) */}
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={isOpen}
              aria-controls="landing-menu"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-primary-soft lg:hidden ${focusRing}`}
            >
              {isOpen ? (
                <X aria-hidden="true" className="size-6" />
              ) : (
                <Menu aria-hidden="true" className="size-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu. It is always in the page; "hidden" just hides it while closed. */}
        <div
          id="landing-menu"
          className={`${
            isOpen ? 'block' : 'hidden'
          } mt-2 rounded-3xl bg-surface p-4 shadow-md lg:hidden`}
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={link.id === activeId ? 'location' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-150 hover:bg-primary-soft ${focusRing} ${
                    link.id === activeId ? 'bg-primary-soft text-primary' : 'text-ink'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row">
            <Link
              to="/login"
              className={`rounded-full border border-primary px-6 py-3 text-center text-base font-semibold text-primary transition-colors duration-150 hover:bg-primary-soft hover:text-primary-deep sm:flex-1 ${focusRing}`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`rounded-full bg-accent-strong px-6 py-3 text-center text-base font-semibold text-white transition-colors duration-150 hover:bg-accent-strong-hover sm:flex-1 ${focusRing}`}
            >
              Start a project
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;
