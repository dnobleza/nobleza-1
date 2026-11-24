import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import landingAssets from '../../assets/landingAssets';
import { focusRing } from './focusRing';

function CtaSection() {
  const { ctaMascot } = landingAssets;

  return (
    <section id="contact" aria-labelledby="cta-title" className="relative pb-16 pt-16 lg:pb-24 lg:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* The panel itself must NOT hide overflow: the mascot sticks out over its top edge. */}
        <div className="relative rounded-3xl bg-linear-to-r from-primary-deep to-primary px-6 pb-24 pt-10 text-white sm:px-10 md:py-12 md:pl-[300px] lg:pl-[340px]">
          {/* Orange wave, bottom right. Its own box clips it to the panel's rounded corner. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          >
            <svg
              viewBox="0 0 400 70"
              preserveAspectRatio="none"
              className="absolute bottom-0 right-0 h-[70px] w-3/5 md:w-[55%]"
            >
              <path d="M0 70 C150 66 280 30 400 6 L400 70 Z" fill="#F59E0B" />
            </svg>
          </div>

          {/* Decorative mascot: hidden below md, overlapping the top-left edge from md up. */}
          {ctaMascot && (
            <img
              src={ctaMascot}
              alt=""
              width={600}
              height={600}
              loading="lazy"
              className="absolute -top-16 left-4 hidden w-[260px] drop-shadow-[0_18px_18px_rgb(30_64_175/0.25)] md:block lg:left-8 lg:w-[290px]"
            />
          )}

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="cta-title"
                className="text-3xl font-bold leading-9 lg:text-[34px] lg:leading-[42px]"
              >
                Let&apos;s Build Something Great Together!
              </h2>
              <p className="mt-2 text-lg">Turn your ideas into reality with CodeHaus.</p>
              <a
                href="mailto:codehausdevelopment@gmail.com"
                className={`mt-3.5 inline-block rounded text-[15px] underline ${focusRing} focus-visible:outline-white`}
              >
                codehausdevelopment@gmail.com
              </a>
            </div>

            {/* On phones the panel has extra bottom padding (pb-24) so the button stays clear of the wave. */}
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 self-start whitespace-nowrap rounded-full bg-accent-strong px-6 py-3 font-semibold text-white ring-1 ring-white/40 transition-colors duration-150 hover:bg-accent-strong-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:self-center"
            >
              Start a project
              <ArrowRight aria-hidden="true" className="size-4.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
