import { ExternalLink } from 'lucide-react';
import landingAssets from '../../assets/landingAssets';
import SectionHeading from './SectionHeading';
import { focusRing } from './focusRing';

// Only real projects. "key" matches the names in landingAssets.projectImages.
// "url" is optional: leave it empty ('') and the "Learn More" button is not shown (no dead links).
const PROJECTS = [
  { key: 'gvnSafeStart', title: 'GVN SafeStart', text: 'Driving school booking platform', url: '' },
  { key: 'metalMarket', title: 'Metal Market PH', text: 'Buy. Sell. Trade.', url: '' },
];

// The subtle dot pattern of the placeholder: a tiny repeating radial gradient (one dot per 24px tile).
const DOT_PATTERN = {
  backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.12) 1.5px, transparent 1.5px)',
  backgroundSize: '24px 24px',
};

function PortfolioSection() {
  const images = landingAssets.projectImages;

  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="relative pt-16 lg:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="portfolio-title"
          title="Our Work"
          subtitle="Explore some of our recent projects."
        />

        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {PROJECTS.map(({ key, title, text, url }) => {
            const image = images?.[key];
            return (
              <li
                key={key}
                style={image ? undefined : DOT_PATTERN}
                className="relative min-h-[220px] overflow-hidden rounded-2xl bg-primary-deep p-8 text-white shadow-[0_10px_30px_-12px_rgb(37_99_235/0.4)] duration-150 motion-safe:transition-transform motion-safe:hover:-translate-y-1 sm:p-9"
              >
                {image && (
                  <>
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                    {/* A deep-blue layer over the screenshot so the white text stays readable. */}
                    <div aria-hidden="true" className="absolute inset-0 bg-primary-deep/70" />
                  </>
                )}
                <div className="relative">
                  <h3 className="text-[28px] font-semibold leading-9 sm:text-3xl">{title}</h3>
                  <p className="mt-2 text-primary-cloud">{text}</p>
                  {/* "url && (...)" draws the button only when url is not empty.
                      target="_blank" opens a new tab; rel="noopener noreferrer" stops that tab
                      from getting access to this page. */}
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Learn more about ${title} (opens in a new tab)`}
                      className={`mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary-deep transition-colors duration-150 hover:bg-primary-soft ${focusRing}`}
                    >
                      Learn More
                      <ExternalLink aria-hidden="true" className="size-4" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default PortfolioSection;
