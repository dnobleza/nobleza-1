import { ExternalLink } from 'lucide-react';
import landingAssets from '../../assets/landingAssets';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { focusRing } from './focusRing';

// Only real projects. To add one: add an entry here, and put its images in landingAssets.js
// under the same "key" (projectLogos for the logo, projectImages for an optional screenshot).
// The layout adapts to how many entries there are. No layout code per project.
// "url" is optional: leave it empty ('') and the "Learn More" button is not shown (no dead links).
// "tags" is optional: the small words under the logo.
const PROJECTS = [
  {
    key: 'metalMarket',
    title: 'Metal Market PH',
    text: 'A platform where buyers and sellers of gold, silver, precious metals and gemstones in the Philippines connect and deal directly.',
    url: 'https://www.metalmarketph.com/',
    tags: ['Gold', 'Silver', 'Precious Metals', 'Gemstones'],
  },
];

// One card. "wide" = true: panel on the left and text on the right from md up (used for a single
// project). "wide" = false: panel on top, text below (used inside the grid).
function ProjectCard({ project, wide }) {
  const { key, title, text, url, tags } = project;
  const image = landingAssets.projectImages?.[key];
  const logo = landingAssets.projectLogos?.[key];

  const cardLayout = wide ? 'grid md:grid-cols-[2fr_3fr]' : 'flex flex-col';
  // The wide panel grows with the card; a grid panel keeps a fixed 16:10 shape so every card matches.
  const panelSize = wide ? 'min-h-[240px]' : 'aspect-[16/10]';

  return (
    <li
      className={`${cardLayout} overflow-hidden rounded-2xl border border-white bg-white/82 shadow-[0_10px_30px_-12px_rgb(37_99_235/0.25)] duration-150 motion-safe:transition-transform motion-safe:hover:-translate-y-1`}
    >
      {/* Image side. A dark ink panel: a real screenshot if one is set, otherwise the logo
          with the tags under it, otherwise just the project name. */}
      <div
        className={`relative flex ${panelSize} flex-col items-center justify-center gap-3 bg-ink ${
          wide ? 'p-6' : 'p-4'
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={`${title} homepage`}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <>
            {logo ? (
              <img
                src={logo}
                alt={`${title} logo`}
                width={512}
                height={512}
                loading="lazy"
                className={wide ? 'size-48 object-contain sm:size-56' : 'size-24 object-contain'}
              />
            ) : (
              <p className="text-2xl font-semibold text-white">{title}</p>
            )}
            {tags?.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-medium text-white"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className={`flex flex-1 flex-col p-8 sm:p-10 ${wide ? 'md:justify-center' : ''}`}>
        <h3 className="text-[28px] font-semibold leading-9 text-navy-deep sm:text-3xl">{title}</h3>
        <p className="mt-3 max-w-prose text-lg leading-7 text-muted-strong">{text}</p>
        {/* "url && (...)" draws the button only when url is not empty.
            target="_blank" opens a new tab; rel="noopener noreferrer" stops that tab
            from getting access to this page. mt-auto pushes the button to the bottom of the
            card so the buttons line up across a row; pt-6 keeps a gap above it. */}
        {url && (
          <div className={`pt-6 ${wide ? '' : 'mt-auto'}`}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Learn more about ${title} (opens in a new tab)`}
              className={`inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-hover ${focusRing}`}
            >
              Learn More
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          </div>
        )}
      </div>
    </li>
  );
}

function PortfolioSection() {
  // No projects: show nothing (no empty "Our Work" heading).
  if (PROJECTS.length === 0) {
    return null;
  }

  const isSingle = PROJECTS.length === 1;
  // Full class names written out, so Tailwind can find them when it builds the CSS.
  // 1 project: no grid (one wide card). 2: two columns from md. 3 or more: three columns from xl.
  let listLayout = '';
  if (PROJECTS.length === 2) {
    listLayout = 'grid gap-6 md:grid-cols-2';
  } else if (PROJECTS.length >= 3) {
    listLayout = 'grid gap-6 md:grid-cols-2 xl:grid-cols-3';
  }

  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="relative pt-16 lg:pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            id="portfolio-title"
            title="Our Work"
            subtitle="Explore some of our recent projects."
          />
        </Reveal>

        <Reveal className="mt-8">
          <ul className={listLayout}>
            {PROJECTS.map((project) => (
              <ProjectCard key={project.key} project={project} wide={isSingle} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export default PortfolioSection;
