import { Heart } from 'lucide-react';
import logo from '../../assets/logo/logo.svg';

const FOOTER_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#contact', label: 'Contact' },
];

// Same idea as focusRing.js, but white: a blue ring would be invisible on the dark navy footer.
const focusRingOnDark =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

function LandingFooter() {
  return (
    // A <footer> outside <main> is the page's "contentinfo" landmark for screen readers.
    <footer className="relative bg-navy-deep pb-8 pt-16 text-primary-soft lg:pt-20">
      {/* Wavy top edge: an SVG sitting just above the footer (bottom-full = right on top of it). */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute bottom-[calc(100%-1px)] left-0 block h-10 w-full fill-navy-deep lg:h-[60px]"
      >
        <path d="M0 60 L0 34 C240 -6 480 6 720 30 C960 54 1200 50 1440 14 L1440 60 Z" />
      </svg>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-block rounded-xl bg-white px-3.5 py-2">
              <img src={logo} alt="CodeHaus" width={486} height={330} className="block h-11 w-auto" />
            </span>
            <p className="mt-2 text-sm">Build. Innovate. Grow.</p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`rounded py-1 transition-colors duration-150 hover:text-white ${focusRingOnDark}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* lucide-react has no brand icons, so this is the GitHub mark drawn as an inline SVG. */}
          <a
            href="https://github.com/dnobleza"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CodeHaus on GitHub (opens in a new tab)"
            className={`flex size-10 items-center justify-center self-start rounded-full bg-white text-navy-deep transition-colors duration-150 hover:bg-primary-soft md:self-auto ${focusRingOnDark}`}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-6">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-5 text-sm sm:flex-row sm:justify-between">
          {/* new Date().getFullYear() asks the browser for the current year, so it never goes stale. */}
          <p>© {new Date().getFullYear()} CodeHaus. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with
            <Heart aria-hidden="true" className="size-4 fill-red-500 text-red-500" />
            <span className="sr-only">love</span>
            in the Philippines
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
