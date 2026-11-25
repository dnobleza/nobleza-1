import { ArrowRight, Headset, LayoutDashboard, Monitor, Palette, Settings, ShieldCheck } from 'lucide-react';
import landingAssets from '../../assets/landingAssets';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import { cardClasses } from './cardStyles';
import { focusRing } from './focusRing';

// "key" matches the names you can use in landingAssets.serviceIcons.
const SERVICES = [
  { key: 'websiteDevelopment', Icon: Monitor, tone: 'blue', title: 'Website Development', text: 'Modern, responsive and SEO-friendly websites.' },
  { key: 'webApplications', Icon: LayoutDashboard, tone: 'blue', title: 'Web Applications', text: 'Powerful and scalable web apps.' },
  { key: 'businessAutomation', Icon: Settings, tone: 'blue', title: 'Business Automation', text: 'Streamline your workflows with smart solutions.' },
  { key: 'uiUxDesign', Icon: Palette, tone: 'orange', title: 'UI/UX Design', text: 'Beautiful and intuitive designs.' },
  { key: 'softwareMaintenance', Icon: ShieldCheck, tone: 'green', title: 'Software Maintenance', text: 'Keep your systems running smoothly.' },
  { key: 'consultingSupport', Icon: Headset, tone: 'blue', title: 'Consulting & Support', text: 'Get expert advice and technical support.' },
];

const TONES = {
  blue: 'bg-primary-soft text-primary-deep',
  orange: 'bg-accent-soft text-warning',
  green: 'bg-success/15 text-success-text',
};

function ServicesSection() {
  const customIcons = landingAssets.serviceIcons;

  return (
    <section id="services" aria-labelledby="services-title" className="relative pt-16 lg:pt-24">
      {/* lg:grid-cols-[1fr_2fr] = two columns on desktop, the right one twice as wide. */}
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
        <Reveal>
          <SectionHeading
            id="services-title"
            title="Our Services"
            subtitle="We offer a wide range of digital solutions to help your business succeed in the online world."
          />
          <a
            href="#contact"
            className={`mt-7 inline-flex items-center gap-2 rounded-full bg-accent-strong px-6 py-3 font-semibold text-white transition-colors duration-150 hover:bg-accent-strong-hover ${focusRing}`}
          >
            Explore Services
            <ArrowRight aria-hidden="true" className="size-4.5" />
          </a>
        </Reveal>

        {/* 1 column on phones, 2 on tablets, 3 on desktop (3 x 2 = six cards).
            Below md each card is compact: icon on the left, text on the right (flex).
            From md up it switches back to the tall, centered card (md:block, md:text-center). */}
        <Reveal>
          <ul className="grid gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {SERVICES.map(({ key, Icon, tone, title, text }) => (
              <li
                key={key}
                className={`flex items-center gap-4 p-4 text-left md:block md:px-5 md:py-7 md:text-center ${cardClasses}`}
              >
                <span
                  className={`flex size-14 shrink-0 items-center justify-center rounded-full md:mx-auto md:mb-3.5 md:size-16 ${TONES[tone]}`}
                >
                  {customIcons?.[key] ? (
                    <img src={customIcons[key]} alt="" loading="lazy" className="size-7 md:size-9" />
                  ) : (
                    <Icon aria-hidden="true" className="size-6 md:size-7.5" />
                  )}
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-navy-deep">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-muted-strong md:mt-1.5">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export default ServicesSection;
